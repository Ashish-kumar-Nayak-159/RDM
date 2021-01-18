import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CommonService } from 'src/app/services/common.service';
import { ChartService } from 'src/app/chart/chart.service';
declare var $: any;

@Component({
  selector: 'app-live-column-chart',
  templateUrl: './live-column-chart.component.html',
  styleUrls: ['./live-column-chart.component.css']
})
export class LiveColumnChartComponent implements OnInit, OnChanges, OnDestroy {

  private chart: am4charts.XYChart;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  @Input() device: any;
  telemetryData: any[] = [];
  selectedAlert: any;
  seriesArr: any[] = [];
  showThreshold = false;
  isOverlayVisible = false;
  modalConfig: any;
  bodyMessage: string;
  headerMessage: string;
  chartStartdate: any;
  chartEnddate: any;
  chartDataFields: any;
  subscriptions: Subscription[] = [];
  constructor(
    private commonService: CommonService,
    private chartService: ChartService
  ) { }

  ngOnInit(): void {
    if (!this.chartConfig.y1AxisProps) {
      this.chartConfig.y1AxisProps = [];
    }
    if (!this.chartConfig.y2AxisProps) {
      this.chartConfig.y2AxisProps = [];
    }
    setTimeout(() => this.plotChart(), 200);
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj && this.chart) {
      if (this.chartConfig.noOfDataPointsForTrend > 0) {
        if (changes.telemetryObj) {
          this.telemetryObj['message_date'] = new Date(this.telemetryObj['message_date']);
          this.telemetryObj['TMD'] = Number(this.telemetryObj['TMD']);
          this.telemetryObj['TMS'] = Number(this.telemetryObj['TMS']);
          if (this.telemetryObj['TMD'] < 1) {
            this.telemetryObj['TMD'] = undefined;
          }
          if (this.telemetryObj['TMS'] < 1) {
            this.telemetryObj['TMS'] = undefined;
          }
          this.telemetryData.push(this.telemetryObj);
        }
        if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
          this.telemetryData.splice(0, 1);
        }
      }
      console.log(this.telemetryData);
      // this.telemetryData.reverse();
      this.chart.data = this.telemetryData;
      // this.chart.validateData();
    }
  }

  plotChart() {
    const chart = am4core.create(this.chartConfig.chartId, am4charts.XYChart);
    this.telemetryObj['TMD'] = Number(this.telemetryObj['TMD']);
    this.telemetryObj['TMS'] = Number(this.telemetryObj['TMS']);
    if (this.telemetryObj['TMD'] < 1) {
      this.telemetryObj['TMD'] = undefined;
    }
    if (this.telemetryObj['TMS'] < 1) {
      this.telemetryObj['TMS'] = undefined;
    }
    this.telemetryObj.message_date = new Date(this.telemetryObj.message_date);
    this.telemetryData.push(this.telemetryObj);
    chart.data = this.telemetryData;

    // Create axes

    const categoryAxis = chart.xAxes.push(new am4charts.DateAxis());
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
    // const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    chart.dateFormatter.inputDateFormat = 'x';
    chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
    // chart.legend = new am4charts.Legend();
    chart.zoomOutButton.disabled = true;
    if (this.device) {
      chart.zoomOutButton.disabled = true;
      chart.exporting.menu = new am4core.ExportMenu();
      chart.exporting.getFormatOptions('xlsx').useLocale = false;
      chart.exporting.getFormatOptions('pdf').pageOrientation = 'landscape';
      chart.exporting.title = this.chartConfig.widgetTitle + ' from ' +
      chart.data[0].message_date.toString() + ' to ' + chart.data[chart.data.length - 1].message_date.toString();
      this.chartDataFields = {
        message_date: 'Timestamp'
      };
      this.chartConfig.y1AxisProps.forEach(prop => {
        const units = prop.value.json_model[prop.id].units;
        this.chartDataFields[prop.id] = prop.name + (units ? (' (' + units + ')') : '');
      });
      this.chartConfig.y2AxisProps.forEach(prop => {
        const units = prop.value.json_model[prop.id].units;
        this.chartDataFields[prop.id] = prop.name + (units ? (' (' + units + ')') : '');
      });
      chart.exporting.dataFields = this.chartDataFields;
      // const list = new am4core.List<string>();
      // list.insertIndex(0, 'message_date');
      // console.log(list);
      // chart.exporting.dateFields = list;
      chart.exporting.getFormatOptions('pdf').addURL = false;
      chart.exporting.dateFormat = 'dd-MM-yyyy hh:mm:ss A a';
      console.log(this.selectedAlert);
      if (this.selectedAlert) {
        chart.exporting.filePrefix = this.selectedAlert.device_id + '_Alert_' + this.selectedAlert.local_created_date;
      } else {
        chart.exporting.filePrefix = this.device.device_id + '_' + chart.data[0].message_date.toString()
        + '_' + chart.data[chart.data.length - 1].message_date.toString();
      }
    }
    chart.cursor = new am4charts.XYCursor();
    // chart.scrollbarX = new am4core.Scrollbar();
    // chart.scrollbarX.parent = chart.bottomAxesContainer;
    chart.logo.disabled = true;
    this.chart = chart;
    // chart.exporting.menu = new am4core.ExportMenu();
    // chart.legend.itemContainers.template.togglable = false;
    // // Create series
    this.createValueAxis(chart, 0);
    this.createValueAxis(chart, 1);
  }

  createValueAxis(chart, axis) {

    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    // if (chart.yAxes.indexOf(valueYAxis) !== 0){
    //   valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    // }
    const arr = axis === 0 ? this.chartConfig.y1AxisProps : this.chartConfig.y2AxisProps;
    arr.forEach((prop, index) => {
      const series = chart.series.push(new am4charts.ColumnSeries());
      series.dataFields.valueY = prop.id;
      series.dataFields.dateX = 'message_date';
      series.units = prop.value.json_model[prop.id].units;
      series.name = prop.name;
      series.propKey = prop.id;
      if (prop.color) {
        series.fill = am4core.color(prop.color);
        series.stroke = am4core.color(prop.color);
      }
      series.columns.template.tooltipText = 'Date: {dateX} \n {name}: [bold]{valueY}[/]';
      series.columns.template.fillOpacity = .8;
      series.compareText = true;
      series.legendSettings.labelText = '{name} ({units})';
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
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal('hide');
    } else if (eventType === 'save') {
      this.removeChart(this.chartConfig.chartId);
      $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal('hide');
    }
  }

  removeChart(chartId) {
    this.removeWidget.emit(chartId);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.dispose();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
