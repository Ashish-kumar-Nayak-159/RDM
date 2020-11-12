import { Component, OnInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.css']
})
export class PieChartComponent implements OnInit {

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
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.plotChart(), 1000);
  }

  plotChart() {
    const chart = am4core.create(this.chartId, am4charts.PieChart);

    const data = [];
    this.telemetryData.forEach((obj, i) => {
      const item: any = {};
      let foundIndex = -1;
      data.forEach((dataObj, i2) => {
        if (dataObj[this.xAxisProps] === obj[this.xAxisProps]) {
          foundIndex = i2;
        }
      });
      if (foundIndex !== -1) {
        data[foundIndex].value += 1;
      } else {
        item[this.xAxisProps] = obj[this.xAxisProps];
        item['value'] = 1;
        data.push(item);
      }
    });
    console.log(data);
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
    chart.exporting.menu = new am4core.ExportMenu();
    chart.legend = new am4charts.Legend();
    chart.legend.itemContainers.template.togglable = false;
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
