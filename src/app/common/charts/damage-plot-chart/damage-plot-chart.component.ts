import { environment } from './../../../../environments/environment';
import { Subscription } from 'rxjs';
import { CommonService } from './../../../services/common.service';
import { Component, NgZone, OnInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartService } from 'src/app/chart/chart.service';
declare var $: any;
import { CONSTANTS } from 'src/app/app.constants';

@Component({
  selector: 'app-damage-plot-chart',
  templateUrl: './damage-plot-chart.component.html',
  styleUrls: ['./damage-plot-chart.component.css'],
})
export class DamagePlotChartComponent implements OnInit {
  private chart: am4charts.XYChart;
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  propertyList: any[] = [];
  asset: any;
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartHeight: any;
  chartWidth: any;
  chartType: any;
  chartTitle: any;
  chartConfig: any;
  chartId: any = 'XYChart';
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  chartStartdate: any;
  chartDataFields: any = {};
  chartEnddate: any;
  subscriptions: Subscription[] = [];
  hideCancelButton = false;
  loader = false;
  loaderMessage = 'Loading Data. Wait...';
  environmentApp = environment.app;
  decodedToken: any;
  constructor(private commonService: CommonService, private chartService: ChartService, private zone: NgZone) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
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
      const data = [];
      const arr = [];
      this.telemetryData.forEach((obj, i) => {
        this.y1AxisProps.forEach((prop) => {
          if (obj[prop.json_key] !== undefined && obj[prop.json_key] !== null) {
            arr.push(obj);
            const keys = this.commonService.sortObjectBasedOnKey(obj[prop.json_key]);
            keys.forEach((key, index) => {
              const newObj: any = {};
              if (obj[prop.json_key][key] !== null && obj[prop.json_key][key] !== undefined) {
                newObj['frequency' + i] = Number(key);
                newObj['value' + i] = obj[prop.json_key][key];
              }
              if (Object.keys(newObj).length > 0) {
                newObj.message_date = new Date(obj.message_date);
                delete newObj.aggregation_end_time;
                delete newObj.aggregation_start_time;
                data.splice(data.length, 0, newObj);
              }
            });
          }
        });
      });

      // this.telemetryData = JSON.parse(JSON.stringify(arr));
      chart.data = data;
      // console.log(data.length);
      // console.log(JSON.stringify(chart.data));
      // console.log(this.telemetryData);
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
      // chart.legend.itemContainers.template.togglable = false;
      //  chart.exporting.menu = new am4core.ExportMenu();
      // chart.exporting.getFormatOptions('xlsx').useLocale = false;
      // chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
      // if (chart.data.length > 0) {
      //   chart.exporting.title =
      //     this.chartTitle +
      //     ' from ' +
      //     chart.data[0].message_date?.toString() +
      //     ' to ' +
      //     chart.data[chart.data.length - 1].message_date.toString();
      // }
      // this.chartDataFields = {
      //   message_date: 'Timestamp',
      // };
      // this.y1AxisProps.forEach((prop) => {
      //   this.propertyList.forEach((propObj) => {
      //     if (prop.json_key === propObj.json_key) {
      //       const units = propObj.json_model[propObj.json_key].units;
      //       this.chartDataFields[prop.json_key] = propObj.name + (units ? ' (' + units + ')' : '');
      //     }
      //   });
      // });
      // chart.exporting.dataFields = this.chartDataFields;
      chart.zoomOutButton.disabled = true;
      // chart.exporting.getFormatOptions('pdf').addURL = false;
      // chart.exporting.dateFormat = 'dd-MM-yyyy HH:mm:ss.nnn';
      // if (chart.data.length > 0) {
      //   if (this.selectedAlert) {
      //     chart.exporting.filePrefix = this.selectedAlert.asset_id + '_Alert_' + this.selectedAlert.local_created_date;
      //   } else if (this.asset?.asset_id) {
      //     chart.exporting.filePrefix =
      //       this.asset.asset_id +
      //       '_' +
      //       chart.data[0].message_date.toString() +
      //       '_' +
      //       chart.data[chart.data.length - 1].message_date.toString();
      //   } else {
      //     chart.exporting.filePrefix =
      //       chart.data[0].message_date.toString() + '_' + chart.data[chart.data.length - 1].message_date.toString();
      //   }
      // }
      chart.scrollbarX = new am4core.Scrollbar();
      chart.scrollbarX.parent = chart.bottomAxesContainer;
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
        unit = propobj.json_model[propobj.json_key].units;
      }
    });
    valueYAxis.title.text = this.getPropertyName(prop.json_key) + (unit ? ' (' + unit + ')' : '');
    // const arr = this.y1AxisProps;
    this.telemetryData.forEach((data, index) => {
      if (data[prop.json_key] !== null && data[prop.json_key] !== undefined) {
        const series = chart.series.push(new am4charts.LineSeries());
        // series.dataFields.dateX = 'message_date';

        // this.propertyList.forEach((propObj) => {
        //   if (propObj.json_key === this.y1AxisProps[0].json_key) {
        //     series.units = propObj.json_model[propObj.json_key].units;
        //   }
        // });
        series.units = unit;
        series.name = this.getPropertyName(prop.json_key);
        // series.xAxis = axis;
        // console.log(this.getPropertyType(prop.json_key));
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
        // series.stroke = this.commonService.getRandomColor();
        series.yAxis = chart.yAxes.getIndex(0);
        series.dataFields.valueX = 'frequency' + index;
        series.dataFields.valueY = 'value' + index;
        // series.groupFields.valueY = 'value';
        series.compareText = true;
        series.strokeWidth = 2;
        const time = this.commonService.convertUTCDateToLocal(data.message_date);
        series.time = time;

        // series.connect = false;
        // series.connect = (this.getPropertyName(prop) === 'Total Mass Discharge' ||
        // this.getPropertyName(prop) === 'Total Mass Suction' ? true : false);
        // series.tensionX = 0.77;
        // series.strokeOpacity = 1;

        series.legendSettings.labelText = '{time}';
        // series.fillOpacity = this.chartType.includes('Area') ? 0.3 : 0;

        // series.tooltipText = 'Date: {time} \n Frequency: [bold]{valueX} Hz \n ({propType}) {name}: [bold]{valueY}[/]';
        const bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.strokeWidth = 2;
        bullet.circle.radius = 1.5;
        bullet.tooltipText =
          'Date: {time} \n Frequency: [bold]{valueX} Hz \n ({propType}) {name}: [bold]{valueY} {units}[/]';
        // chart.cursor.snapToSeries = series;
        // chart.cursor.snapToSeries = series;
        this.seriesArr.push(series);
      }
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
              const units = propObj.json_model[propObj.json_key].units;
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
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal' + this.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget(this.chartId);
      $('#confirmRemoveWidgetModal' + this.chartId).modal('hide');
    }
  }

  removeWidget(chartId) {}

  ngOnDestroy(): void {
    if (this.chart) {
      alert('heree');
      this.chart.dispose();
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
