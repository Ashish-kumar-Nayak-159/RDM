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
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
  selector: 'app-cylinderwidget',
  templateUrl: './cylinderwidget.component.html',
  styleUrls: ['./cylinderwidget.component.css']
})
export class CylinderwidgetComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private chart: am4charts.XYChart3D[] = [];
  @Input() id: string;
  @Input() value: string;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Input() asset: any;
  // @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  bodyMessage: string;
  headerMessage: string;
  decodedToken: any;
  isOverlayVisible = false;
  telemetryData: any;
  subscriptions: Subscription[] = [];
  widgetStringFromMenu: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;
  chartId: any;
  telmetryDivAddonClass: any;
  innerClass: any;
  overlayLeft: any = '60px';

  constructor(private commonService: CommonService, private zone: NgZone, private chartService: ChartService) { }

  ngOnInit(): void {
    if (this.chartConfig) {
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
      this.chartConfig.properties = this.chartConfig.properties[0].properties;

      this.telmetryDivAddonClass = this.chartConfig.widget_type === 'RectangleWidget' ? 'mt-n2' : '';
      this.innerClass = this.chartConfig.widget_type === 'CylinderWidget' ? 'mt-n4' : 'mt-n2';

    }
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
  }

  ngAfterViewInit() {
    if (this.chartConfig.widget_type === 'RectangleWidget') {
      this.generateChart();
    }
    else {
      this.generateRecChart();
    }
  }

  ngOnChanges(changes) {
    if (this.chart && changes.telemetryObj) {
      this.chartConfig.properties.forEach((prop, index) => {
        const chart = this.chart[index];
        if (chart) {
          this.telemetryData = {};
          if (
            this.telemetryObj[prop.property?.json_key]?.value !== undefined &&
            this.telemetryObj[prop.property?.json_key]?.value !== null
          ) {
            this.telemetryData.fillCapacity = Number(this.telemetryObj[prop.property?.json_key]?.value || '0');
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
      const chart = am4core.create(this.chartConfig.chart_id + '_chart_' + index, am4charts.XYChart3D);
      chart.hiddenState.properties.opacity = 0;
      chart.logo.disabled = true;

      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'category';
      categoryAxis.renderer.grid.template.location = 0;
      categoryAxis.renderer.grid.template.strokeOpacity = 0;
      categoryAxis.renderer.labels.template.disabled = true;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // valueAxis.min = (prop?.minCapacityValue - Math.round((prop?.maxCapacityValue / 100) * 27)) || -10;
      // valueAxis.max = (prop?.maxCapacityValue + Math.round((prop?.maxCapacityValue / 100) * 40)) || 200;
      valueAxis.min = (prop?.minCapacityValue < 10 ? 10 : prop?.minCapacityValue) || 10;
      // valueAxis.max = (prop?.maxCapacityValue + Math.round((prop?.maxCapacityValue / 100) * 100)) || 300;
      valueAxis.max = prop?.maxCapacityValue * 2 || 300;
      valueAxis.paddingBottom = 10;
      // valueAxis.marginTop = 10;
      // valueAxis.paddingTop = 25;
      valueAxis.strictMinMax = true;
      valueAxis.logarithmic = true;
      // valueAxis.treatZeroAs = 0.00001;
      // valueAxis.extraMax = 0.5;
      valueAxis.renderer.fontSize = '0.6em';
      valueAxis.renderer.grid.template.strokeOpacity = 0;
      valueAxis.renderer.baseGrid.disabled = true;
      valueAxis.renderer.minGridDistance = 50;
      // valueAxis.renderer.labels.template.disabled = true;
      // valueAxis.renderer.minLabelPosition = 0.05;
      // valueAxis.renderer.maxLabelPosition = 0.95;
      // valueAxis.renderer.labels.template.adapter.add("text", function(text) {
      //   if (+text < valueAxis.min || +text > valueAxis.max) {
      //     return "";
      //   }
      //   return text;
      // });

      const series1 = chart.series.push(new am4charts.ConeSeries());
      series1.dataFields.valueY = 'fillCapacity';
      series1.dataFields.categoryX = 'category';
      series1.columns.template.width = am4core.percent(80);
      series1.columns.template.fillOpacity = 0.9;
      series1.columns.template.strokeOpacity = 1;
      series1.columns.template.strokeWidth = 2;
      // series1.columns.template.column3D.tooltipText = "{valueY}";

      const series2 = chart.series.push(new am4charts.ConeSeries());
      series2.dataFields.valueY = 'empty';
      series2.dataFields.categoryX = 'category';
      series2.stacked = true;
      series2.columns.template.width = am4core.percent(80);
      series2.columns.template.fill = am4core.color('#000');
      series2.columns.template.fillOpacity = 0.1;
      series2.columns.template.stroke = am4core.color('#ccc');
      series2.columns.template.strokeOpacity = 0.2;
      series2.columns.template.strokeWidth = 2;

      this.telemetryData = {};
      if (
        this.telemetryObj[prop.property?.json_key]?.value !== undefined &&
        this.telemetryObj[prop.property?.json_key]?.value !== null
      ) {
        this.telemetryData.fillCapacity = Number(this.telemetryObj[prop.property?.json_key]?.value || '0');
        this.telemetryData.empty = Number((prop?.maxCapacityValue || '100') - this.telemetryData.fillCapacity);
        this.telemetryData.category = '';
      }
      chart.data = [this.telemetryData];
      this.chart.push(chart);
    });
  }

  generateRecChart() {
    this.chartConfig.properties.forEach((prop, index) => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartConfig.chart_id + '_chart_' + index, am4charts.XYChart3D);
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
        this.telemetryObj[prop.property?.json_key]?.value !== undefined &&
        this.telemetryObj[prop.property?.json_key]?.value !== null
      ) {
        this.telemetryData.fillCapacity = Number(this.telemetryObj[prop.property?.json_key]?.value || '0');
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
      'Are you sure you want to remove this ' + this.chartConfig.widget_title + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget();
      $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal('hide');
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
      this.chart.forEach((sub) => sub.dispose());
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
