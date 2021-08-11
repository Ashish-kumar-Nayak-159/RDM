import { Subscription } from 'rxjs';
import { ChartService } from './../../../chart/chart.service';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit, OnDestroy {

  private chart: am4charts.XYChart;
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  propertyList: any[] = [];
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartHeight: any;
  chartWidth: any;
  chartType: any;
  chartTitle: any;
  chartId: any;
  chartConfig: any;
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  asset: any;
  chartStartdate: any;
  chartEnddate: any;
  chartDataFields: any;
  subscriptions: Subscription[] = [];
  hideCancelButton = false;
  loader = false;
  loaderMessage = 'Loading Data. Wait...';
  decodedToken: any;
  constructor(
    private commonService: CommonService,
    private chartService: ChartService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.loader = true;
    setTimeout(() => this.plotChart(), 200);
    this.subscriptions.push(this.chartService.toggleThresholdEvent.subscribe((ev) => {
      this.showThreshold = ev;
      this.toggleThreshold(ev);
    }));
    this.subscriptions.push(
      this.chartService.togglePropertyEvent.subscribe((property) => this.toggleProperty(property)));
    this.subscriptions.push(
      this.chartService.disposeChartEvent.subscribe(() => {
        if (this.chart) {
          // alert('5888');
          this.chart.dispose();
        }
        this.subscriptions.forEach(sub => sub.unsubscribe());
      })
    );
    }

  plotChart() {
    this.zone.runOutsideAngular(() => {
    am4core.options.onlyShowOnViewport = true;
    am4core.options.autoDispose = true;
    am4core.options.viewportTarget = [document.getElementById('mainChartDiv')];
    const chart = am4core.create(this.chartId, am4charts.XYChart);

    const data = [];
    this.telemetryData.forEach((obj, i) => {
      const newObj: any = {};
      this.y1AxisProps.forEach(prop => {
        if (obj[prop] !== undefined && obj[prop] !== null) { {
          newObj[prop] = obj[prop];
        }
      });
      this.y2AxisProps.forEach(prop => {
        if (obj[prop] !== undefined && obj[prop] !== null) { {
          newObj[prop] = obj[prop];
        }
      });
      if (Object.keys(newObj).length > 0) {
        newObj.message_date = new Date(obj.message_date);
        delete obj.aggregation_end_time;
        delete obj.aggregation_start_time;
        data.splice(data.length, 0, newObj);
      }
    });
    chart.data = data;
    if (chart.data.length > 0) {
    chart.exporting.title = this.chartTitle + ' from ' + chart.data[0].message_date?.toString()
      + ' to ' + chart.data[chart.data.length - 1].message_date.toString();
    }
    this.loaderMessage = 'Loading Chart. Wait...';
    // Create axes

    const categoryAxis = chart.yAxes.push(new am4charts.DateAxis());
    if (this.chartStartdate) {
      const date = new Date(0);
      date.setUTCSeconds(this.chartStartdate);
      categoryAxis.min = date.getTime();
    }

    if (this.chartEnddate) {
      const date = new Date(0);
      date.setUTCSeconds(this.chartEnddate);
      categoryAxis.max = date.getTime();
    }
    // categoryAxis.dataFields.category = 'message_date';
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 70;
    categoryAxis.groupData = true;
      categoryAxis.groupCount = 200;
  //  const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    if (this.selectedAlert) {
      const range = categoryAxis.axisRanges.create();
      range.date = new Date(this.selectedAlert.local_created_date);
      range.grid.stroke = am4core.color('red');
      range.grid.strokeWidth = 2;
      range.grid.strokeOpacity = 1;
      range.axisFill.tooltip = new am4core.Tooltip();
      range.axisFill.tooltipText = 'Alert Time';
      range.axisFill.interactionsEnabled = true;
      range.axisFill.isMeasured = true;
    }
    chart.dateFormatter.inputDateFormat = 'x';
    chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.togglable = false;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.getFormatOptions('xlsx').useLocale = false;
    chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
    console.log(chart.data);
    if (chart.data.length > 0) {
      chart.exporting.title = this.chartTitle + ' from ' + chart.data[0].message_date?.toString()
      + ' to ' + chart.data[chart.data.length - 1].message_date.toString();
    }
    this.chartDataFields = {
      message_date: 'Timestamp'
    };
    this.y1AxisProps.forEach(prop => {
      this.propertyList.forEach(propObj => {
        if (prop === propObj.json_key) {
          const units = propObj.json_model[propObj.json_key].units;
          this.chartDataFields[prop] = propObj.name + (units ? (' (' + units + ')') : '');
        }
      });
    });
    this.y2AxisProps.forEach(prop => {
      this.propertyList.forEach(propObj => {
        if (prop === propObj.json_key) {
          const units = propObj.json_model[propObj.json_key].units;
          this.chartDataFields[prop] = propObj.name + (units ? (' (' + units + ')') : '');
        }
      });
    });
    chart.exporting.dataFields = this.chartDataFields;
    chart.exporting.getFormatOptions('pdf').addURL = false;
    chart.exporting.dateFormat = 'dd-MM-yyyy HH:mm:ss.nnn';
    if (chart.data.length > 0) {
    if (this.selectedAlert) {
      chart.exporting.filePrefix = this.selectedAlert.asset_id + '_Alert_' + this.selectedAlert.local_created_date;
    } else if (this.asset?.asset_id) {
      chart.exporting.filePrefix = this.asset.asset_id + '_' + chart.data[0].message_date.toString()
      + '_' + chart.data[chart.data.length - 1].message_date.toString();
    } else {
      chart.exporting.filePrefix = chart.data[0].message_date.toString()
      + '_' + chart.data[chart.data.length - 1].message_date.toString();
    }
    }
    chart.cursor = new am4charts.XYCursor();
    chart.scrollbarX = new am4core.Scrollbar();
    chart.scrollbarX.parent = chart.bottomAxesContainer;
    chart.zoomOutButton.disabled = true;
    chart.logo.disabled = true;
    chart.events.on('ready', (ev) => {
      this.loader = false;
      this.loaderMessage = 'Loading Data. Wait...';
    });
    this.chart = chart;
    // // Create series
    this.createValueAxis(chart, 0);
    this.createValueAxis(chart, 1);
  });
  }

  toggleProperty(prop) {
    this.seriesArr.forEach((item, index) => {
      const seriesColumn = this.chart.series.getIndex(index);
      if (prop === item.propKey) {

        item.compareText = !item.compareText;
        // seriesColumn.isActive = !seriesColumn.isActive;
        if (item.isHiding || item.isHidden) {
          item.show();
          this.propertyList.forEach(propObj => {
            if (prop === propObj.json_key) {
              const units = propObj.json_model[propObj.json_key].units;
              this.chartDataFields[prop] = propObj.name + (units ? (' (' + units + ')') : '');
            }
          });
        }
        else {
          item.hide();
          delete this.chartDataFields[prop];

        }
      }
    });
    this.toggleThreshold(this.showThreshold);

  }

  getPropertyName(key) {
    return this.propertyList.filter(prop => prop.json_key === key)[0]?.name || key;
  }

  getPropertyType(key) {
    return this.propertyList.filter(prop => prop.json_key === key)[0]?.type || 'Measured';
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
          this.propertyList.forEach(prop => {
            if (prop.json_key === item.propKey) {
              propObj = prop;
            }
          });
        }
      });
      if (count === 1 && this.showThreshold) {
        this.seriesArr.forEach(series => series.xAxis.axisRanges.clear());
        this.createThresholdSeries(shownItem.xAxis, propObj);
      } else {
        this.seriesArr.forEach(series => series.xAxis.axisRanges.clear());
      }
    } else {
      this.seriesArr.forEach(series => series.xAxis.axisRanges.clear());
    }
  }

  createValueAxis(chart, axis) {

    const valueYAxis = chart.xAxes.push(new am4charts.ValueAxis());
    // if (chart.yAxes.indexOf(valueYAxis) !== 0){
    //   valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    // }
    const arr = axis === 0 ? this.y1AxisProps : this.y2AxisProps;
    arr.forEach((prop, index) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueX = prop;
      series.dataFields.dateY = 'message_date';
      this.propertyList.forEach(propObj => {
        if (propObj.json_key === prop) {
          series.units = propObj.json_model[propObj.json_key].units;
        }
      });
      series.name = this.getPropertyName(prop);
      series.propType = this.getPropertyType(prop) === 'Derived Properties' ? 'D' : 'M';
      console.log('rrrrrrrrrrrrrrr', series.propType);
      series.propKey = prop;
      series.columns.template.fillOpacity = .8;
      series.compareText = true;
      if (series.units) {
        series.legendSettings.labelText = '({propType}) {name} ({units})';
        } else {
          series.legendSettings.labelText = '({propType}) {name}';
        }
      if (series.units) {
        series.columns.template.tooltipText = 'Date: {dateX} \n ({propType}) {name} ({units}): [bold]{valueY}[/]';
      } else {
        series.columns.template.tooltipText = 'Date: {dateX} \n ({propType}) {name}: [bold]{valueY}[/]';
      }
      const columnTemplate = series.columns.template;
      columnTemplate.strokeWidth = 2;
      columnTemplate.strokeOpacity = 1;

      this.seriesArr.push(series);
    });
    // if (this.y1AxisProps.length === 1 && this.y2AxisProps.length === 0) {
    //   const propObj = this.propertyList.filter(prop => prop.json_key === this.y1AxisProps[0])[0];
    //   this.createThresholdSeries(valueYAxis, propObj);
    // }
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
  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true
    };
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal_' + this.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal_' + this.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget(this.chartId);
      $('#confirmRemoveWidgetModal_' + this.chartId).modal('hide');
    }
  }

  removeWidget(chartId) {

  }



  ngOnDestroy(): void {
      if (this.chart) {
        this.chart.dispose();
      }
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }



}
