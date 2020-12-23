import { CommonService } from './../../../services/common.service';
import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, NgZone, OnInit, PLATFORM_ID, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartService } from 'src/app/chart/chart.service';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-live-chart-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.css']
})
export class LiveChartComponent implements OnInit, OnDestroy {

  private chart: am4charts.XYChart;
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  propertyList: any[] = [];
  device: any;
  xAxisProps: any;
  y1AxisProps: any[] = [];
  y2AxisProps: any[] = [];
  chartHeight: any;
  chartWidth: any;
  chartType: any;
  chartTitle: any;
  chartId: any = 'XYChart';
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  constructor(
    private commonService: CommonService,
    private chartService: ChartService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.plotChart(), 200);
    this.chartService.toggleThresholdEvent.subscribe((ev) => {
      this.showThreshold = ev;
      this.toggleThreshold(ev);
    });
    this.chartService.togglePropertyEvent.subscribe((property) => this.toggleProperty(property));
  }

  plotChart() {
    this.zone.runOutsideAngular(() => {
      console.log(document.getElementById(this.chartId));
      const chart = am4core.create(this.chartId, am4charts.XYChart);
      chart.paddingRight = 20;
      const data = [];
      this.telemetryData.forEach((obj, i) => {
        const newObj = {...obj};
        newObj.message_date = new Date(obj.message_date);
        delete newObj.aggregation_end_time;
        delete newObj.aggregation_start_time;
        newObj['Total Mass Discharge'] = Number(newObj['Total Mass Discharge']);
        newObj['Total Mass Suction'] = Number(newObj['Total Mass Suction']);
        if (newObj['Total Mass Discharge'] < 1) {
          newObj['Total Mass Discharge'] = undefined;
        }
        if (newObj['Total Mass Suction'] < 1) {
          newObj['Total Mass Suction'] = undefined;
        }
        data.splice(data.length, 0, newObj);
      });
      console.log(data);
      chart.data = data;
      chart.dateFormatter.inputDateFormat = 'x';
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 70;
      // const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // valueAxis.tooltip.disabled = true;
      // valueAxis.renderer.minWidth = 35;
      this.createValueAxis(chart, 0);
      this.createValueAxis(chart, 1);
      chart.legend = new am4charts.Legend();

      chart.cursor = new am4charts.XYCursor();
      // const scrollbarX = new am4charts.XYChartScrollbar();
      // scrollbarX.series.push(series);
      // chart.scrollbarX = scrollbarX;
      if (this.selectedAlert) {
        const range = dateAxis.axisRanges.create();
        range.date = new Date(this.selectedAlert.local_created_date);
        range.grid.stroke = am4core.color('red');
        range.grid.strokeWidth = 2;
        range.grid.strokeOpacity = 1;
        range.axisFill.tooltip = new am4core.Tooltip();
        range.axisFill.tooltipText = 'Alert Time';
        range.axisFill.interactionsEnabled = true;
        range.axisFill.isMeasured = true;
      }
      chart.legend.itemContainers.template.togglable = false;
      // chart.dateFormatter.dateFormat = 'DD-MMM-YYYY hh:mm:ss A';
      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.getFormatOptions("xlsx").useLocale = false;
      chart.exporting.getFormatOptions("pdf").pageOrientation = 'landscape';
      chart.exporting.title = this.chartTitle + ' from ' + chart.data[0].message_date.toString() + ' to ' + chart.data[chart.data.length - 1].message_date.toString();
      const obj = {
        "message_date": "Timestamp"
      }
      this.y1AxisProps.forEach(prop => {
        this.propertyList.forEach(propObj => {
          if (prop === propObj.json_key) {
            const units = propObj.json_model[propObj.json_key].units;
            obj[prop] = propObj.name + (units ? (' (' + units + ')') : '');
          }
        });
      });
      this.y2AxisProps.forEach(prop => {
        this.propertyList.forEach(propObj => {
          if (prop === propObj.json_key) {
            const units = propObj.json_model[propObj.json_key].units;
            obj[prop] = propObj.name + (units ? (' (' + units + ')') : '');
          }
        });
      });
      chart.exporting.dataFields = obj;
      const list = new am4core.List<string>();
      list.insertIndex(0, 'message_date');
      console.log(list);
      chart.exporting.dateFields = list;
      chart.exporting.getFormatOptions("pdf").addURL = false;
      chart.exporting.dateFormat = 'dd-MM-yyyy hh:mm:ss A a';
      console.log(this.selectedAlert);
      if (this.selectedAlert) {
        chart.exporting.filePrefix = this.selectedAlert.device_id + '_Alert_' + this.selectedAlert.local_created_date;
      } else {
        chart.exporting.filePrefix = this.device.device_id + '_' + chart.data[0].message_date.toString() + '_' + chart.data[chart.data.length - 1].message_date.toString();
      }
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
    if (chart.yAxes.indexOf(valueYAxis) !== 0){
      valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    }
    const arr = axis === 0 ? this.y1AxisProps : this.y2AxisProps;
    arr.forEach((prop, index) => {
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = 'message_date';
      this.propertyList.forEach(propObj => {
        if (propObj.json_key === prop) {
          series.units = propObj.json_model[propObj.json_key].units;
        }
        console.log('unitssss    ', series.units);
      });
      series.name =  this.getPropertyName(prop);
      // series.stroke = this.commonService.getRandomColor();
      series.yAxis = valueYAxis;
      series.dataFields.valueY =  prop;
      series.compareText = true;
      series.strokeWidth = 2;
   //   series.connect = (prop === 'Total Mass Discharge' ? true : false);
     // series.tensionX = 0.77;
      series.strokeOpacity = 1;
      series.legendSettings.labelText = '{name} ({units})';
      series.fillOpacity = this.chartType.includes('Area') ? 0.3 : 0;
      series.tooltipText = '{name} ({units}): [bold]{valueY}[/]';

      // // Make bullets grow on hover
      // const bullet = series.bullets.push(new am4charts.CircleBullet());
      // bullet.circle.strokeWidth = 2;
      // bullet.circle.radius = 4;
      // bullet.circle.fill = am4core.color('#fff');

      // const bullethover = bullet.states.create('hover');
      // bullethover.properties.scale = 1.3;
      this.seriesArr.push(series);
    });
    valueYAxis.tooltip.disabled = true;
    // valueYAxis.renderer.labels.template.fillOpacity = this.chartType.includes('Area') ? 0.2 : 0;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    valueYAxis.renderer.opposite = (axis === 1);
    valueYAxis.renderer.minWidth = 35;
    // if (this.y1AxisProps.length === 1 && this.y2AxisProps.length === 0) {
    //   const propObj = this.propertyList.filter(prop => prop.json_key === this.y1AxisProps[0])[0];
    //   this.createThresholdSeries(valueYAxis, propObj);
    // }
  }

  getPropertyName(key) {
    return this.propertyList.filter(prop => prop.json_key === key)[0].name;
  }

  toggleProperty(prop) {
    this.seriesArr.forEach((item, index) => {
      console.log(item.isActive);
      const seriesColumn = this.chart.series.getIndex(index);
      if (prop === item.name) {
        item.compareText = !item.compareText;
        // seriesColumn.isActive = !seriesColumn.isActive;
        if (item.isHiding || item.isHidden) {
          item.show();
        }
        else {
          item.hide();
        }
      }
    });
    this.toggleThreshold(this.showThreshold);

  }

  toggleThreshold(show) {
    if (show) {
      let shownItem;
      let propObj;
      // console.log(ev.target.dataItem.dataContext);
      let count = 0;
      this.seriesArr.forEach((item, index) => {
        const seriesColumn = this.chart.series.getIndex(index);
        if (item.compareText) {
          count += 1;
          shownItem = seriesColumn;
          this.propertyList.forEach(prop => {
            if (prop.json_key === item.name) {
              propObj = prop;
            }
          });
        }
      });
      if (count === 1 && this.showThreshold) {
        this.seriesArr.forEach(series => series.yAxis.axisRanges.clear());
        this.createThresholdSeries(shownItem.yAxis, propObj);
      } else {
        this.seriesArr.forEach(series => series.yAxis.axisRanges.clear());
      }
    } else {
      this.seriesArr.forEach(series => series.yAxis.axisRanges.clear());
    }
    console.log(this.seriesArr);
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true
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

  removeWidget(chartId) {

  }



  ngOnDestroy(): void {
      if (this.chart) {
        this.chart.dispose();
      }
  }

}
