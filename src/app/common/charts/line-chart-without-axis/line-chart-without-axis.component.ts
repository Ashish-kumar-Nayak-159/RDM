import { Component, Input, NgZone, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { ChartService } from 'src/app/chart/chart.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

declare var $: any;
@Component({
  selector: 'app-line-chart-without-axis',
  templateUrl: './line-chart-without-axis.component.html',
  styleUrls: ['./line-chart-without-axis.component.css']
})
export class LineChartWithoutAxisComponent implements OnInit, OnDestroy, OnChanges {

  @Input() chartId: string;
  @Input() telemetryData: any[] = [];
  @Input() property: string;
  private chart: am4charts.XYChart;
  min = 0;
  max = 100;
  average: number;


  constructor(
    private chartService: ChartService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    setTimeout(() => this.plotChart(), 200);
  }

  ngOnChanges(changes) {
    if (changes.telemetryData && this.chart) {
      const data = [];
      this.telemetryData.forEach((obj, i) => {
        const newObj = {
          message_date: new Date(obj.message_date)
        };
        newObj[this.property] = obj[this.property];
        data.splice(data.length, 0, newObj);
      });
      data.reverse();
      this.chart.data = data;
    }
  }

  plotChart() {
    this.zone.runOutsideAngular(() => {
      console.log(document.getElementById(this.chartId));
      const chart = am4core.create(this.chartId, am4charts.XYChart);
      const data = [];
      const valueArr = [];
      this.telemetryData.forEach((obj, i) => {
        const newObj = {
          message_date: new Date(obj.message_date)
        };
        newObj[this.property] = obj[this.property];
        data.splice(data.length, 0, newObj);
        // if (Number(obj[this.property])) {
        valueArr.push(Number(obj[this.property]));
        // }
      });
      if (valueArr.length > 0) {
      this.max = Math.round(valueArr.reduce((a, b) => Math.max(a, b)));
      this.min = Math.round(valueArr.reduce((a, b) => Math.min(a, b)));
      this.average = Math.round((this.min + this.max) / 2);
      }
      console.log(this.property);
      console.log('min   ', this.min);
      console.log('max   ', this.max);
      console.log('average', this.average);
      console.log(data);
      data.reverse();
      chart.data = data;
      chart.logo.disabled = true;
      chart.marginLeft = -100;
      chart.dateFormatter.inputDateFormat = 'x';
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.minGridDistance = 70;
      dateAxis.hidden = true;
      // const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      // valueAxis.tooltip.disabled = true;
      // valueAxis.renderer.minWidth = 35;
      this.createValueAxis(chart, 0);
      // chart.legend = new am4charts.Legend();
     //  chart.cursor = new am4charts.XYCursor();
      // const scrollbarX = new am4charts.XYChartScrollbar();
      // scrollbarX.series.push(series);
      // chart.scrollbarX = scrollbarX;

      this.chart = chart;
    });
  }



  createValueAxis(chart, axis) {

    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    if (chart.yAxes.indexOf(valueYAxis) !== 0){
      valueYAxis.syncWithAxis = chart.yAxes.getIndex(0);
    }
    valueYAxis.renderer.grid.template.disabled = true;
    valueYAxis.renderer.labels.template.disabled = true;
    valueYAxis.labelsEnabled = false;
    // valueYAxis.min = this.min;
    // valueYAxis.max = this.max;


    // chart.events.on('ready', (ev) => {
    //   valueYAxis.min = valueYAxis.minZoomed;
    //   valueYAxis.max = valueYAxis.maxZoomed;
    // });
    // valueYAxis.events.on('ready', (ev) => {
    //   ev.target.min = this.min;
    //   ev.target.max = this.max;
    // });
    // valueYAxis.strictMinMax = true;

    const range0 = valueYAxis.axisRanges.create();
    range0.value = this.min;
    range0.label.fontSize = '0.6em';
    range0.label.fontWeight = 'bold';
    range0.label.text = this.min;

    const range1 = valueYAxis.axisRanges.create();
    range1.value = this.max;
    range1.label.fontSize = '0.6em';
    range1.label.fontWeight = 'bold';
    range1.label.text = this.max;
    // range1.endValue = this.average;

    const range2 = valueYAxis.axisRanges.create();
    range2.value = this.average;
   //  range2.endValue = this.max;
    range2.label.fontSize = '0.6em';
    range2.label.fontWeight = 'bold';
    range2.label.text = this.average;
    // range1.axisFill.fill = am4core.color('#229954');
    // range1.axisFill.fillOpacity = 0.2;
    // range1.grid.strokeOpacity = 0;
    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'message_date';
    series.name =  this.property;
    series.stroke = '#8a0909';
    series.yAxis = valueYAxis;
    series.dataFields.valueY =  this.property;
    series.compareText = true;
    series.strokeWidth = 1;
    // series.tensionX = 0.77;
    series.strokeOpacity = 1;
    series.fillOpacity = 0;
    // series.tooltipText = '{name}: [bold]{valueY}[/]';
    // valueYAxis.tooltip.disabled = true;
    // valueYAxis.renderer.labels.template.fillOpacity = this.chartType.includes('Area') ? 0.2 : 0;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    // valueYAxis.renderer.opposite = (axis === 1);
    // valueYAxis.renderer.minWidth = 35;
    // valueYAxis.hidden = true;
    // if (this.y1AxisProps.length === 1 && this.y2AxisProps.length === 0) {
    //   const propObj = this.propertyList.filter(prop => prop.json_key === this.y1AxisProps[0])[0];
    //   this.createThresholdSeries(valueYAxis, propObj);
    // }
  }


  ngOnDestroy(): void {
      if (this.chart) {
        this.chart.dispose();
      }
  }

}
