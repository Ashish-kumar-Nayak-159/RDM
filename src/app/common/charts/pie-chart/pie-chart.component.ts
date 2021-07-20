import { Component, OnInit, OnDestroy } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit, OnDestroy {

  private chart: am4charts.PieChart;
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
  hideCancelButton = false;
  asset: any;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.plotChart(), 200);
  }

  plotChart() {
    am4core.options.autoDispose = true;
    const chart = am4core.create(this.chartId, am4charts.PieChart);

    const data = [];
    this.telemetryData.forEach((telemetryObj, i) => {
      const item: any = {};
      let foundIndex = -1;
      data.forEach((dataObj, i2) => {
        if (dataObj[this.xAxisProps] === telemetryObj[this.xAxisProps]) {
          foundIndex = i2;
        }
      });
      if (foundIndex !== -1) {
        data[foundIndex].value += 1;
      } else {
        item[this.xAxisProps] = telemetryObj[this.xAxisProps];
        item['value'] = 1;
        data.push(item);
      }
    });
    chart.data = data;


    // Add and configure Series
    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = 'value';
    pieSeries.dataFields.category = this.xAxisProps;
    pieSeries.slices.template.stroke = am4core.color('#fff');
    pieSeries.slices.template.strokeOpacity = 1;

    // This creates initial animation
    pieSeries.hiddenState.properties.opacity = 1;
    pieSeries.hiddenState.properties.endAngle = -90;
    pieSeries.hiddenState.properties.startAngle = -90;
    chart.hiddenState.properties.radius = am4core.percent(0);
    // chart.exporting.menu = new am4core.ExportMenu();
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.togglable = false;
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.getFormatOptions('xlsx').useLocale = false;
    chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
    chart.exporting.title = this.chartTitle + ' from ' + chart.data[0].message_date.toString()
    + ' to ' + chart.data[chart.data.length - 1].message_date.toString();
    const obj = {
      message_date: 'Timestamp'
    };
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
    chart.exporting.dateFields = list;
    chart.exporting.getFormatOptions('pdf').addURL = false;
    chart.exporting.dateFormat = 'dd-MM-yyyy HH:mm:ss.nnn';
    if (this.selectedAlert) {
      chart.exporting.filePrefix = this.selectedAlert.asset_id + '_Alert_' + this.selectedAlert.local_created_date;
    } else {
      chart.exporting.filePrefix = this.asset.asset_id + '_' +
      chart.data[0].message_date.toString() + '_' + chart.data[chart.data.length - 1].message_date.toString();
    }
    this.chart = chart;
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true
    };
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal').modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget(this.chartId);
      $('#confirmRemoveWidgetModal').modal('hide');
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
