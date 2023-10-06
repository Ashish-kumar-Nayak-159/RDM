import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit, OnChanges, EventEmitter, Output, AfterViewInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;
@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css'],
})
export class GaugeChartComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() id: string;
  @Input() value: string;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  hand: any[] = [];
  chart: any[] = [];
  label: am4core.Label[] = [];
  @Input() asset: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  bodyMessage: string;
  headerMessage: string;
  decodedToken: any;
  widgetStringFromMenu: any;
  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
  }

  ngAfterViewInit() {
    this.loadChart();
  }

  ngOnChanges(changes) {
    if (this.chart && changes.telemetryObj) {
      //  this.label.text = changes.value.currentValue;
      this.chartConfig.properties.forEach((prop, index) => {
        if (this.hand[index] && this.chart[index]) {
          this.hand[index].value = Number(this.telemetryObj[prop.property?.composite_key]?.value || '0');
        }
        if (
          this.chart[index] &&
          !this.hand[index] &&
          this.telemetryObj[prop.property?.composite_key]?.value !== undefined &&
          this.telemetryObj[prop.property?.composite_key]?.value !== null
        ) {
          const hand = this.chart[index].hands.push(new am4charts.ClockHand());
          hand.radius = am4core.percent(97);
          hand.value = Number(this.telemetryObj[prop.property?.composite_key]?.value || '0');
          this.hand.splice(index, 0, hand);
        }
      });
    }
  }

  loadChart() {
    this.chartConfig.properties.forEach((prop, index) => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartConfig.chartId + '_chart_' + index, am4charts.GaugeChart);
      chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
      if (this.chartConfig.startAngle !== undefined && this.chartConfig.startAngle !== null) {
        chart.startAngle = -(this.chartConfig.startAngle + 180) % 360;
      }
      if (this.chartConfig.endAngle !== undefined && this.chartConfig.endAngle !== null) {
        chart.endAngle = -(this.chartConfig.endAngle + 180) % 360;
      }
      chart.innerRadius = am4core.percent(70);
      chart.logo.disabled = true;
      const axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
      axis.min = prop?.minRangeValue || 0;
      axis.max = prop?.maxRangeValue || 100;
      axis.strictMinMax = true;
      axis.renderer.radius = am4core.percent(70);
      axis.renderer.fontSize = '0.6em';
      axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor('background');
      axis.renderer.grid.template.strokeOpacity = 0.3;
      axis.renderer.minGridDistance = 500;
      const colorSet = new am4core.ColorSet();

      const range0 = axis.axisRanges.create();
      range0.value = prop.low_min || prop?.minRangeValue || 0;
      range0.endValue = prop.low_max || prop.normal_min || prop?.maxRangeValue || 50;
      range0.axisFill.fillOpacity = 1;
      range0.axisFill.fill = am4core.color(prop.low_color || '#308014');
      range0.axisFill.zIndex = -1;
      const range1 = axis.axisRanges.create();
      range1.value = prop.normal_min || prop.low_max || prop?.minRangeValue || 50;
      range1.endValue = prop.normal_max || prop.high_min || prop?.maxRangeValue || 80;
      range1.axisFill.fillOpacity = 1;
      range1.axisFill.fill = am4core.color(prop.normal_color || '#fecc4d');
      range1.axisFill.zIndex = -1;
      const range2 = axis.axisRanges.create();
      range2.value = prop.high_min || prop.normal_max || prop?.minRangeValue || 50;
      range2.endValue = prop.high_max || prop?.maxRangeValue || 100;
      range2.axisFill.fillOpacity = 1;
      range2.axisFill.fill = am4core.color(prop.high_color || '#c80815');
      range2.axisFill.zIndex = -1;

      if (
        this.telemetryObj[prop.property?.composite_key]?.value !== undefined &&
        this.telemetryObj[prop.property?.composite_key]?.value !== null
      ) {
        const hand = chart.hands.push(new am4charts.ClockHand());
        hand.radius = am4core.percent(97);
        hand.value = Number(this.telemetryObj[prop.property?.composite_key]?.value || '0');
        this.hand.splice(index, 0, hand);
      }
      this.chart.splice(index, 0, chart);
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
}
