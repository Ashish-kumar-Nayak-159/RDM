import { Component, Input, OnInit, OnChanges } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { constants } from 'fs';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent implements OnInit, OnChanges {

  @Input() id: string;
  @Input() value: string;
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  hand: any[] = [];
  chart: any[] = [];
  label: am4core.Label[] = [];
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => this.loadChart(), 500);
  }

  ngOnChanges(changes) {
    if (this.chart && changes.telemetryObj) {
     //  this.label.text = changes.value.currentValue;
      this.chartConfig.properties.forEach((prop, index) => {
        if (this.hand[index] && this.chart[index]) {
          this.hand[index].value = Number(this.telemetryObj[prop.property.json_key] || '0');
        }
      });
    }
  }

  loadChart() {
    this.chartConfig.properties.forEach((prop, index) => {
    const chart = am4core.create(this.chartConfig.chartId + '_chart_' + index, am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect
    if (this.chartConfig.startAngle) {
      chart.startAngle = this.chartConfig.startAngle;
    }
    if (this.chartConfig.endAngle) {
      chart.endAngle = this.chartConfig.endAngle;
    }
    chart.innerRadius = am4core.percent(70);
    chart.logo.disabled = true;
    const axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    axis.min = 0;
    axis.max = 100;
    axis.renderer.radius = am4core.percent(70);
    axis.renderer.fontSize = '0.6em';
    axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor('background');
    axis.renderer.grid.template.strokeOpacity = 0.3;
    axis.renderer.minGridDistance = 2500;
    const colorSet = new am4core.ColorSet();

    const range0 = axis.axisRanges.create();
    range0.value = prop.low_min || 0;
    range0.endValue = prop.low_max || prop.normal_min || 50;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = am4core.color(prop.low_color || '#6dc068');
    range0.axisFill.zIndex = - 1;

    const range1 = axis.axisRanges.create();
    range1.value = prop.normal_min || prop.low_max || 50;
    range1.endValue = prop.normal_max || prop.high_min || 80;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = am4core.color(prop.normal_color || '#fecc4d');
    range1.axisFill.zIndex = -1;

    const range2 = axis.axisRanges.create();
    range2.value = prop.high_min || prop.normal_max || 50;
    range2.endValue = prop.high_max || 100;
    range2.axisFill.fillOpacity = 1;
    range2.axisFill.fill = am4core.color(prop.high_color || '#fe5959');
    range2.axisFill.zIndex = -1;

    // const label = chart.radarContainer.createChild(am4core.Label);
    // label.isMeasured = false;
    // label.fontSize = '0.8em';
    // label.x = am4core.percent(50);
    // label.horizontalCenter = 'middle';
    // label.verticalCenter = 'bottom';
    // // label.dataItem = data;
    // label.marginTop = 2;
    // label.text = this.value ? this.value : '0';
    // label.text = "{score}";

    const hand = chart.hands.push(new am4charts.ClockHand());
    hand.radius = am4core.percent(97);
    hand.value = Number(this.telemetryObj[prop.property.json_key] || '0');
    // console.log(this.id, '=====', hand.value);
    this.chart.splice(index, 0, chart);
    this.hand.splice(index, 0, hand);
    // this.label = label;

    });
  }

  openConfirmRemoveWidgetModal() {

  }
}
