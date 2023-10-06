import { CommonService } from './../../../services/common.service';
import {
  Component,
  Input,
  NgZone,
  OnInit,
  OnChanges,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-rectangle-widget',
  templateUrl: './rectangle-widget.component.html',
  styleUrls: ['./rectangle-widget.component.css'],
})
export class RectangleWidgetComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private chart: am4charts.XYChart3D[] = [];
  @Input() id: string;
  @Input() value: string;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Input() asset: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  bodyMessage: string;
  headerMessage: string;
  decodedToken: any;
  isOverlayVisible = false;
  chartId: any = 'XYChart3D';
  telemetryData: any;
  subscriptions: Subscription[] = [];
  widgetStringFromMenu: any;

  constructor(private commonService: CommonService, private zone: NgZone, private chartService: ChartService) { }

  ngOnInit(): void {

    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
  }

  ngAfterViewInit() {
    this.generateChart();
  }

  ngOnChanges(changes) {
    if (this.chart && changes.telemetryObj) {
      this.chartConfig.properties.forEach((prop, index) => {
        const chart = this.chart[index];
        if (chart) {
          this.telemetryData = {};
          if (
            this.telemetryObj[prop.property?.composite_key]?.value !== undefined &&
            this.telemetryObj[prop.property?.composite_key]?.value !== null
          ) {
            this.telemetryData.fillCapacity = Number(this.telemetryObj[prop.property?.composite_key]?.value || '0');
            this.telemetryData.empty = Number((prop?.maxCapacityValue || '100') - this.telemetryData.fillCapacity);
            this.telemetryData.category = '';
            chart.data = [this.telemetryData];
          }
        }
      });
    }
  }

  generateChart() {

    this.chartConfig.properties.forEach((prop, index) => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartConfig.chartId + '_chart_' + index, am4charts.XYChart3D);
      chart.hiddenState.properties.opacity = 0;
      chart.logo.disabled = true;
      chart.angle = 50;

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'category';
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.grid.template.strokeOpacity = 0;
      categoryAxis.renderer.labels.template.disabled = true;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.min = (prop?.minCapacityValue === 0 ? 1 : prop?.minCapacityValue) || 1;
      valueAxis.max = prop?.maxCapacityValue || 100;
      valueAxis.strictMinMax = true;
      valueAxis.logarithmic = true;
      valueAxis.renderer.fontSize = '0.6em';
      valueAxis.renderer.grid.template.strokeOpacity = 0;
      valueAxis.renderer.minGridDistance = 50;
      valueAxis.renderer.baseGrid.disabled = true;
      // valueAxis.renderer.labels.template.disabled = true;

      const series1 = chart.series.push(new am4charts.ColumnSeries3D());
      series1.dataFields.valueY = 'fillCapacity';
      series1.dataFields.categoryX = 'category';
      series1.columns.template.column3D.width = am4core.percent(80);
      series1.columns.template.column3D.fillOpacity = 0.9;
      series1.columns.template.column3D.strokeOpacity = 1;
      series1.columns.template.column3D.strokeWidth = 2;
      // series1.columns.template.column3D.tooltipText = "{valueY}";

      const series2 = chart.series.push(new am4charts.ColumnSeries3D());
      series2.dataFields.valueY = 'empty';
      series2.dataFields.categoryX = 'category';
      series2.stacked = true;
      series2.columns.template.column3D.width = am4core.percent(80);
      series2.columns.template.column3D.fill = am4core.color('#000');
      series2.columns.template.column3D.fillOpacity = 0.1;
      series2.columns.template.column3D.stroke = am4core.color('#ccc');
      series2.columns.template.column3D.strokeOpacity = 0.2;
      series2.columns.template.column3D.strokeWidth = 2;

      this.telemetryData = {};
      if (
        this.telemetryObj[prop.property?.composite_key]?.value !== undefined &&
        this.telemetryObj[prop.property?.composite_key]?.value !== null
      ) {
        this.telemetryData.fillCapacity = Number(this.telemetryObj[prop.property?.composite_key]?.value || '0');
        this.telemetryData.empty = Number((prop?.maxCapacityValue || '100') - this.telemetryData.fillCapacity);
        this.telemetryData.category = '';
      }
      chart.data = [this.telemetryData];
      this.chart.push(chart);

    });
  }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
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
      this.chart.forEach((sub) => sub.dispose());
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
