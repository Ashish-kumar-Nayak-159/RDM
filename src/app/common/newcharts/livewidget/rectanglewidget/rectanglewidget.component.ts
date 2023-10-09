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
  selector: 'app-rectanglewidget',
  templateUrl: './rectanglewidget.component.html',
  styleUrls: ['./rectanglewidget.component.css']
})
export class RectanglewidgetComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  private chart: am4charts.XYChart3D[] = [];
  @Input() id: string;
  @Input() value: string;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Input() asset: any;
  @Input() type: any;
  // @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  bodyMessage: string;
  headerMessage: string;
  decodedToken: any;
  isOverlayVisible = false;
  latestPropWiseTelemetryData: any;
  subscriptions: Subscription[] = [];
  widgetStringFromMenu: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;
  chartId: any;
  telmetryDivAddonClass: any;
  innerClass: any;
  overlayLeft: any = '60px';
  startPoint: any = {};
  currentDate: string;


  constructor(private commonService: CommonService, private zone: NgZone, private chartService: ChartService) { }

  ngOnInit(): void {
    if (this.chartConfig) {
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;

      this.telmetryDivAddonClass = this.chartConfig.widget_type === 'RectangleWidget' ? 'mt-n2' : '';
      this.innerClass = this.chartConfig.widget_type === 'CylinderWidget' ? 'mt-n4' : 'mt-n2';

    }

    if (this.telemetryObj && this.type == 'LogicalView') {
      setTimeout(() => {
        if (this.telemetryObj && this.type == 'LogicalView') {
          this.chartConfig.properties.forEach((prop, cIndex) => {
            if (this.chart.length > cIndex) {
              this.refreshLatestTelemetryInChart(this.chart[cIndex], prop);
            }
          });
        }
      }, 400);
    }
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.generateChart();
    }, 400);
  }

  refreshLatestTelemetryInChart(chartItem: am4charts.XYChart3D, prop: any) {
    this.currentDate = this.commonService.convertUTCDateToLocalDate(new Date().toISOString(), CONSTANTS.DEFAULT_DATETIME_STR_FORMAT);
    const compositeKey = prop.composite_key;
    if (this.telemetryObj.hasOwnProperty(compositeKey)) {
      if (!this.latestPropWiseTelemetryData || !this.latestPropWiseTelemetryData.hasOwnProperty(compositeKey) || (
        this.latestPropWiseTelemetryData[compositeKey].hasOwnProperty('date') &&
        this.telemetryObj[compositeKey].hasOwnProperty('date') &&
        this.latestPropWiseTelemetryData[compositeKey].date < this.telemetryObj[compositeKey].date &&
        this.telemetryObj[compositeKey].hasOwnProperty('value') &&
        this.telemetryObj[compositeKey]['value'] !== undefined &&
        this.telemetryObj[compositeKey]['value'] !== null)) {
        if (!this.latestPropWiseTelemetryData) this.latestPropWiseTelemetryData = {};
        if (prop?.data_type === 'Number' && prop.hasOwnProperty('digitsAfterDecimals')) this.telemetryObj[compositeKey].value = this.telemetryObj[compositeKey].value.toFixed(prop.digitsAfterDecimals);
        this.latestPropWiseTelemetryData[compositeKey] = this.telemetryObj[compositeKey];
      }
    }
    if (chartItem && this.latestPropWiseTelemetryData?.hasOwnProperty(compositeKey) &&
      this.latestPropWiseTelemetryData[compositeKey].hasOwnProperty('value')) {
      chartItem.data = [{
        fillCapacity: Number(this.latestPropWiseTelemetryData[compositeKey]['value']),
        empty: Number(prop?.maxCapacityValue || '100') - Number(this.latestPropWiseTelemetryData[compositeKey]['value']),
        category: ''
      }];
    }
  }

  ngOnChanges(changes) {
    if (this.chart && changes.telemetryObj) {
      this.chartConfig.properties.forEach((prop, cIndex) => {
        const chartItem = this.chart.length > cIndex ? this.chart[cIndex] : undefined;
        this.refreshLatestTelemetryInChart(chartItem, prop);
      });
    }
    // if (this.chart && changes.telemetryObj) {

    //   this.chartConfig.properties.forEach((prop, index) => {
    //     const chart = this.chart[index];
    //     if (!this.startPoint[prop.composite_key]) {
    //       this.startPoint[prop.composite_key] = new Date(this.telemetryObj[prop?.composite_key]?.date);
    //     }
    //     if (new Date(this.telemetryObj[prop?.composite_key]?.date) >= this.startPoint[prop.composite_key]) {
    //       if (chart) {
    //         this.telemetryData = {};

    //         if (prop.asset_id == this.telemetryObj.asset_id &&
    //           this.telemetryObj[prop?.composite_key]?.value !== undefined &&
    //           this.telemetryObj[prop?.composite_key]?.value !== null
    //         ) {
    //           this.telemetryData.fillCapacity = Number(this.telemetryObj[prop?.composite_key]?.value || '0');
    //           this.telemetryData.empty = Number((prop?.maxCapacityValue || '100') - this.telemetryData.fillCapacity);
    //           this.telemetryData.category = '';
    //           this.startPoint[prop.composite_key] = prop.lastDate;
    //           chart.data = [this.telemetryData];
    //         }
    //       }

    //       if (prop?.asset_id == this.telemetryObj?.asset_id && this.telemetryObj[prop?.composite_key] &&
    //         (this.telemetryObj[prop?.composite_key]?.value !== undefined
    //           && this.telemetryObj[prop?.composite_key]?.value !== null)) {
    //         if (prop?.data_type === 'Number') {
    //           prop.lastValue = this.telemetryObj[prop?.composite_key]?.value?.toFixed(prop.digitsAfterDecimals)
    //         }
    //         else {
    //           prop.lastValue = this.telemetryObj[prop?.composite_key]?.value
    //         }
    //       }

    //       if (prop?.asset_id == this.telemetryObj?.asset_id) {
    //         prop.lastDate = this.telemetryObj[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date
    //       }
    //     }
    //   });
    // }
  }

  generateChart() {

    this.chartConfig.properties.forEach((prop, index) => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartConfig.chart_id + 'd_chart_' + index, am4charts.XYChart3D);
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
      this.refreshLatestTelemetryInChart(chart, prop);
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

