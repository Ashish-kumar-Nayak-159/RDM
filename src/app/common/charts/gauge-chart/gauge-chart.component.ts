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
  hand: any;
  chart: any;
  label: am4core.Label;
  constructor() { }

  ngOnInit(): void {
    setTimeout(() => this.loadChart(), 500);
  }

  ngOnChanges(changes) {
    console.log(changes);
    if (this.chart && changes.value) {
      this.label.text = changes.value.currentValue;
      this.hand.showValue(Number(changes.value.currentValue), 1000, am4core.ease.cubicOut);
    }
  }

  loadChart() {

    const chart = am4core.create(this.id, am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

    chart.innerRadius = am4core.percent(70);

    const axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    axis.min = 0;
    axis.max = 100;
    axis.renderer.radius = am4core.percent(80);
    axis.strictMinMax = true;
    axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor('background');
    axis.renderer.grid.template.strokeOpacity = 0.3;
    axis.renderer.minGridDistance = 2500;
    const colorSet = new am4core.ColorSet();

    const range0 = axis.axisRanges.create();
    range0.value = 0;
    range0.endValue = 50;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = colorSet.getIndex(0);
    range0.axisFill.zIndex = - 1;

    const range1 = axis.axisRanges.create();
    range1.value = 50;
    range1.endValue = 80;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = colorSet.getIndex(2);
    range1.axisFill.zIndex = -1;

    const range2 = axis.axisRanges.create();
    range2.value = 80;
    range2.endValue = 100;
    range2.axisFill.fillOpacity = 1;
    range2.axisFill.fill = colorSet.getIndex(4);
    range2.axisFill.zIndex = -1;

    const label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = '1em';
    label.x = am4core.percent(50);
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'bottom';
    // label.dataItem = data;
    label.text = this.value;
    // label.text = "{score}";

    const hand = chart.hands.push(new am4charts.ClockHand());
    hand.showValue(Number(this.value), 1000, am4core.ease.cubicOut);
    this.chart = chart;
    this.hand = hand;
    this.label = label;
    console.log(this.chart);

  }

}
