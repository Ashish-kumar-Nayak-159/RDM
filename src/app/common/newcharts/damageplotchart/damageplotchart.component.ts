import { environment } from './../../../../environments/environment';
import { Subscription } from 'rxjs';
import { CommonService } from './../../../services/common.service';
import { Component, EventEmitter, Input, NgZone, OnInit, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartService } from 'src/app/services/chart/chart.service';
declare var $: any;
import { CONSTANTS } from 'src/app/constants/app.constants';

@Component({
  selector: 'app-damageplotchart',
  templateUrl: './damageplotchart.component.html',
  styleUrls: ['./damageplotchart.component.css']
})
export class DamageplotchartComponent implements OnInit {
  private chart: am4charts.XYChart;
  selectedAlert: any;
  seriesArr: any[] = [];
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartType: any;
  chartId: any = 'XYChart';
  showThreshold = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  chartStartdate: any;
  chartDataFields: any = {};
  chartEnddate: any;
  subscriptions: Subscription[] = [];
  loader = false;
  loaderMessage = 'Loading Data. Wait...';
  environmentApp = environment.app;
  dataLimitExceeded = false

  @Input() chartConfig: any;
  @Input() propertyList: any;
  @Input() asset: any;
  @Input() assetModel: any;
  @Input() chartTitle: any;
  @Input() hideCancelButton: any;
  @Input() telemetryData: any[] = [];
  @Input() chartWidth: any;
  @Input() chartHeight: any;
  @Input() isOverlayVisible: any;
  // @Input() chartId: any;
  @Input() decodedToken: any;
  @Input() widgetStringFromMenu: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;

  constructor(private commonService: CommonService, private chartService: ChartService, private zone: NgZone) { }
  ngOnInit(): void {
    if (this.chartConfig) {
      this.y1AxisProps = this.chartConfig.y1axis;
      this.y2AxisProps = this.chartConfig.y2axis;
      this.xAxisProps = this.chartConfig.xAxis;
      this.chartType = this.chartConfig.chartType;
      this.chartTitle = this.chartConfig.title;
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
    }

    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.loader = true;
    setTimeout(() => {
      if (!this.isOverlayVisible) {
        this.plotChart();
      } else {
        this.loader = false;
      }
    }, 200);
    this.subscriptions.push(
      this.chartService.toggleThresholdEvent.subscribe((ev) => {
        this.showThreshold = ev;
        this.toggleThreshold(ev);
      })
    );
    this.subscriptions.push(
      this.chartService.togglePropertyEvent.subscribe((property) => this.toggleProperty(property))
    );
    this.subscriptions.push(
      this.chartService.disposeChartEvent.subscribe(() => {
        if (this.chart) {
          // alert('5888');
          this.chart.dispose();
        }
        this.subscriptions.forEach((sub) => sub.unsubscribe());
      })
    );
  }

  plotChart() {
    // am4core.options.onlyShowOnViewport = true;
    am4core.options.minPolylineStep = 5;
    // am4core.options.viewportTarget = [document.getElementById('mainChartDiv')];

    // am4core.options.queue = true;
    this.zone.runOutsideAngular(() => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartId, am4charts.XYChart);
      chart.paddingRight = 20;
      let data = [];
      this.telemetryData.forEach((obj, i) => {
        this.y1AxisProps.forEach((prop) => {
          if (obj[prop.json_key] !== undefined && obj[prop.json_key] !== null) {
            let keys = this.commonService.sortObjectBasedOnKey(obj[prop.json_key]);
            keys.forEach((key, index) => {
              let newObj: any = {};
              if (obj[prop.json_key][key] !== null && obj[prop.json_key][key] !== undefined) {
                newObj['frequency' + i] = Number(key);
                newObj[prop.json_key + '_' + i] = obj[prop.json_key][key];
              }
              let flag = false;
              let item = data.filter(f => f['frequency' + i] == newObj['frequency' + i] && f[prop.json_key + '_' + i] == newObj[prop.json_key + '_' + i])
              if (item.length > 0) {
                flag = true;
              }
              if (!flag && Object.keys(newObj).length > 0) {
                data.splice(data.length, 0, newObj);
              }
            });
          }
        });
      });
      // this.telemetryData = JSON.parse(JSON.stringify(arr));
      if (data.length > 4000) {
        this.loader = false;
        this.dataLimitExceeded = true;
        this.chart = chart
        return
      }
      chart.data = data;
      this.loaderMessage = 'Loading Chart. Wait...';
      chart.dateFormatter.inputDateFormat = 'x';
      chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      // chart.durationFormatter.durationFormat = "hh:ii:ss";

      // this.telemetryData.forEach((data, index) => {
      const categoryAxis = chart.xAxes.push(new am4charts.ValueAxis());
      // categoryAxis.dataFields.date = 'frequency' + index;
      // categoryAxis.renderer.minGridDistance = 70;
      categoryAxis.renderer.grid.template.location = 0.5;
      categoryAxis.renderer.labels.template.location = 0.5;
      categoryAxis.title.text = 'Frequnecy (Hz)';
      // chart.cursor = new am4charts.XYCursor();
      // chart.cursor.xAxis = categoryAxis;
      this.createValueAxis(chart, categoryAxis);
      // });
      chart.legend = new am4charts.Legend();
      chart.logo.disabled = true;
      chart.legend.maxHeight = 80;
      chart.legend.scrollable = true;
      chart.legend.labels.template.maxWidth = 30;
      chart.legend.labels.template.truncate = true;

      chart.events.on('ready', (ev) => {
        this.loader = false;
        this.loaderMessage = 'Loading Data. Wait...';
      });
      chart.legend.itemContainers.template.togglable = false;
      chart.legend.itemContainers.template.events.on('hit', (ev) => {
        this.seriesArr.forEach((item, index) => {
          const seriesColumn = this.chart.series.getIndex(index);
          if (ev.target.dataItem.dataContext['time'] === item.time) {
            if (item.isHiding || item.isHidden) {
              item.show();
            } else {
              item.hide();
            }
          }
        });
      });
      chart.zoomOutButton.disabled = true;
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarX.parent = chart.bottomAxesContainer;
      chart.scrollbarY = new am4core.Scrollbar();
      chart.scrollbarY.parent = chart.leftAxesContainer;
      this.chart = chart;
    });
  }

  createThresholdSeries(valueAxis, propObj) {
    propObj.threshold = propObj.threshold ? propObj.threshold : {};

    if (propObj.threshold.l1 && propObj.threshold.h1) {
      const rangeL1H1 = valueAxis.axisRanges.create();
      rangeL1H1.value = propObj.threshold.l1;
      rangeL1H1.endValue = propObj.threshold.h1;
      rangeL1H1.axisFill.fill = am4core.color('#229954');
      rangeL1H1.axisFill.fillOpacity = 0.2;
      rangeL1H1.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.l1 && propObj.threshold.l2) {
      const rangeL1L2 = valueAxis.axisRanges.create();
      rangeL1L2.value = propObj.threshold.l2;
      rangeL1L2.endValue = propObj.threshold.l1;
      rangeL1L2.axisFill.fill = am4core.color('#f6c23e');
      rangeL1L2.axisFill.fillOpacity = 0.2;
      rangeL1L2.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.h1 && propObj.threshold.h2) {
      const rangeH1H2 = valueAxis.axisRanges.create();
      rangeH1H2.value = propObj.threshold.h1;
      rangeH1H2.endValue = propObj.threshold.h2;
      rangeH1H2.axisFill.fill = am4core.color('#f6c23e');
      rangeH1H2.axisFill.fillOpacity = 0.2;
      rangeH1H2.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.l2 && propObj.threshold.l3) {
      const rangeL2L3 = valueAxis.axisRanges.create();
      rangeL2L3.value = propObj.threshold.l3;
      rangeL2L3.endValue = propObj.threshold.l2;
      rangeL2L3.axisFill.fill = am4core.color('#fb5515');
      rangeL2L3.axisFill.fillOpacity = 0.2;
      rangeL2L3.grid.strokeOpacity = 0;
    }
    if (propObj.threshold.h2 && propObj.threshold.h3) {
      const rangeH2H3 = valueAxis.axisRanges.create();
      rangeH2H3.value = propObj.threshold.h2;
      rangeH2H3.endValue = propObj.threshold.h3;
      rangeH2H3.axisFill.fill = am4core.color('#fb5515');
      rangeH2H3.axisFill.fillOpacity = 0.2;
      rangeH2H3.grid.strokeOpacity = 0;
    }
  }

  createValueAxis(chart, axis) {
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    const prop = this.y1AxisProps[0];
    let unit;
    this.propertyList.forEach((propobj) => {
      if (propobj.json_key === this.y1AxisProps[0].json_key) {
        if (propobj.json_model[propobj.json_key] && propobj.json_model[propobj.json_key]?.units)
          unit = propobj.json_model[propobj.json_key].units;
      }
    });
    valueYAxis.title.text = this.chartTitle + (unit ? ' (' + unit + ')' : '');
    // const arr = this.y1AxisProps;
    this.telemetryData.forEach((data, index) => {
      const color = this.commonService.getRandomColor();
      let count = 0;
      this.y1AxisProps.forEach((prop, i) => {
        if (data[prop.json_key] !== null && data[prop.json_key] !== undefined) {
          const series = chart.series.push(new am4charts.LineSeries());
          series.units = unit;
          series.name = this.getPropertyName(prop.json_key);
          const proptype = this.getPropertyType(prop.json_key);
          series.propType =
            proptype === 'Edge Derived Properties'
              ? 'ED'
              : proptype === 'Cloud Derived Properties'
                ? 'CD'
                : proptype === 'Derived KPIs'
                  ? 'DK'
                  : 'M';
          series.propKey = prop.json_key;
          // series.xAxis = axis;
          series.stroke = color;
          series.yAxis = valueYAxis;
          series.dataFields.valueX = 'frequency' + index;
          series.dataFields.valueY = prop.json_key + '_' + index;
          // series.groupFields.valueY = 'value';
          series.compareText = true;
          series.strokeWidth = 2;
          const time = data.message_date;
          series.time = time;
          series.connect = true;
          // series.connect = false;
          // series.connect = (this.getPropertyName(prop) === 'Total Mass Discharge' ||
          // this.getPropertyName(prop) === 'Total Mass Suction' ? true : false);
          // series.tensionX = 0.77;
          // series.strokeOpacity = 1;
          if (count === 0) {
            series.legendSettings.labelText = '{time}';
          } else {
            series.hiddenInLegend = true;
          }
          count++;
          series.tensionX = 0.999999999999;
          // series.fillOpacity = this.chartType.includes('Area') ? 0.3 : 0;

          // series.tooltipText = 'Date: {time} \n Frequency: [bold]{valueX} Hz \n ({propType}) {name}: [bold]{valueY}[/]';
          const bullet = series.bullets.push(new am4charts.CircleBullet());
          bullet.strokeWidth = 2;
          bullet.circle.radius = 0.00001;
          bullet.tooltipText =
            'Date: {time} \n Frequency: [bold]{valueX} Hz \n ({propType}) {name}: [bold]{valueY} {units}[/]';
          // chart.cursor.snapToSeries = series;
          // chart.cursor.snapToSeries = series;
          this.seriesArr.push(series);
        }
      });
    });
    valueYAxis.tooltip.disabled = true;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    valueYAxis.renderer.minWidth = 35;
    // if (this.y1AxisProps.length === 1 && this.y2AxisProps.length === 0) {
    //   const propObj = this.propertyList.filter(prop => prop.json_key === this.y1AxisProps[0])[0];
    //   this.createThresholdSeries(valueYAxis, propObj);
    // }
  }

  getPropertyName(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.name || key;
  }

  getPropertyType(key) {
    return this.propertyList.filter((prop) => prop.json_key === key)[0]?.type || 'Measured';
  }

  toggleProperty(prop) {
    // alert('here  ' + prop);
    this.seriesArr.forEach((item, index) => {
      const seriesColumn = this.chart.series.getIndex(index);
      if (prop === item.propKey) {
        item.compareText = !item.compareText;
        // seriesColumn.isActive = !seriesColumn.isActive;
        if (item.isHiding || item.isHidden) {
          item.show();
          this.propertyList.forEach((propObj) => {
            if (prop === propObj.json_key) {
              const units = propObj.json_model[propObj.json_key]?.units;
              this.chartDataFields[prop] = propObj.name + (units ? ' (' + units + ')' : '');
            }
          });
        } else {
          item.hide();
          delete this.chartDataFields[prop];
        }
      }
    });
    this.toggleThreshold(this.showThreshold);
  }

  toggleThreshold(show) {
    if (show) {
      let shownItem;
      let propObj;
      let count = 0;
      this.seriesArr.forEach((item, index) => {
        const seriesColumn = this.chart.series.getIndex(index);
        if (item.compareText) {
          count += 1;
          shownItem = seriesColumn;
          this.propertyList.forEach((prop) => {
            if (prop.json_key === item.propKey) {
              propObj = prop;
            }
          });
        }
      });
      if (count === 1 && this.showThreshold) {
        this.seriesArr.forEach((series) => series.yAxis.axisRanges.clear());
        this.createThresholdSeries(shownItem.yAxis, propObj);
      } else {
        this.seriesArr.forEach((series) => series.yAxis.axisRanges.clear());
      }
    } else {
      this.seriesArr.forEach((series) => series.yAxis.axisRanges.clear());
    }
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget();
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    }
  }

  removeWidget() {
    this.onMenu(2);
  }

  onMenu(type) {
    if (type == 0) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Edit" });
    }
    else if (type == 1) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Clone" });
    }
    else {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Delete" });
    }
  }
  ngOnDestroy(): void {
    if (this.chart) {
      alert('heree');
      this.chart.dispose();
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
