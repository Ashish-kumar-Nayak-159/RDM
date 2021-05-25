import { Subscription } from 'rxjs';
import { Component, Input, NgZone, OnInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { ChartService } from 'src/app/chart/chart.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

declare var $: any;
@Component({
  selector: 'app-line-chart-without-axis',
  templateUrl: './line-chart-without-axis.component.html',
  styleUrls: ['./line-chart-without-axis.component.css']
})
export class LineChartWithoutAxisComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() chartId: string;
  @Input() telemetryData: any[] = [];
  @Input() property: string;
  private chart: am4charts.XYChart;
  min = 0;
  max = 100;
  average: number;
  range0: any;
  range1: any;
  range2: any;
  valueAxis: any;
  subscriptions: Subscription[] = [];

  constructor(
    private chartService: ChartService,
    private zone: NgZone
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.chartService.clearDashboardTelemetryList.subscribe(arr => {
      this.telemetryData = JSON.parse(JSON.stringify([]));
      if (this.chart) {
        this.chart.data = JSON.parse(JSON.stringify([]));
        this.chart.invalidateData();
      }
    }));
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  ngOnChanges(changes) {
    if (changes.telemetryData && this.chart) {

      const data = [];
      const valueArr = [];
      const dateArr = [];
      this.telemetryData.forEach((obj, i) => {
        const newObj = {
          message_date: new Date(obj.message_date)
        };
        newObj[this.property] = obj[this.property];
        data.splice(data.length, 0, newObj);
        valueArr.push(Number(obj[this.property]));
        dateArr.push(newObj.message_date);
      });
      if (valueArr.length > 0) {
        this.max = Math.ceil(valueArr.reduce((a, b) => Math.max(a, b)));
        this.min = Math.floor(valueArr.reduce((a, b) => Math.min(a, b)));
        if (this.min === this.max) {
          this.min = this.min - 5;
          this.max = this.max + 5;
        }
        this.average = Number(((this.min + this.max) / 2).toFixed(1));
        this.valueAxis.min = this.min;
        this.valueAxis.max = this.max;
        this.range0.value = this.min;
        this.range1.value = this.max;
        this.range2.value = this.average;
        this.range0.label.text = this.min.toString();
        this.range1.label.text = this.max.toString();
        this.range2.label.text = this.average.toString();
        this.range1.grid.disabled = (this.min === this.max);
        this.range2.grid.disabled = ((this.min + this.max) === (this.average * 2));
      }
      this.chart.data = data;
      this.chart.validateData();
    }
  }



  plotChart() {
    this.zone.runOutsideAngular(() => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartId, am4charts.XYChart);
      const data = [];
      const valueArr = [];
      this.telemetryData.forEach((obj, i) => {
        const newObj = {
          message_date: new Date(obj.message_date)
        };
        newObj[this.property] = obj[this.property];
        data.splice(data.length, 0, newObj);
        valueArr.push(Number(obj[this.property]));
      });
      if (valueArr.length > 0) {
        this.max = Math.ceil(valueArr.reduce((a, b) => Math.max(a, b)));
        this.min = Math.floor(valueArr.reduce((a, b) => Math.min(a, b)));
        if (this.min === this.max) {
          this.min = this.min - 5;
          this.max = this.max + 5;
        }
        this.average = Number(((this.min + this.max) / 2).toFixed(1));
      }
      data.reverse();
      chart.data = data;
      chart.logo.disabled = true;
      chart.marginLeft = -100;
      chart.dateFormatter.inputDateFormat = 'x';
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.hidden = true;
      chart.events.on('beforedatavalidated', (ev) => {
        chart.data.sort((a, b) => {
          return ((a.message_date)) - ((b.message_date));
        });
      });
      this.createValueAxis(chart, 0);
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
    valueYAxis.renderer.minGridDistance = 40;
    valueYAxis.min = this.min;
    valueYAxis.max = this.max;
    valueYAxis.strictMinMax = true;

    const range0 = valueYAxis.axisRanges.create();
    range0.value = this.min;
    range0.label.fontSize = '0.6em';
    range0.label.fontWeight = 'bold';
    range0.label.text = this.min.toString();
    this.range0 = range0;

    const range1 = valueYAxis.axisRanges.create();
    range1.value = this.max;
    range1.label.fontSize = '0.6em';
    range1.label.fontWeight = 'bold';
    range1.label.text = this.max.toString();
    this.range1 = range1;

    const range2 = valueYAxis.axisRanges.create();
    range2.value = this.average;
    range2.label.fontSize = '0.6em';
    range2.label.fontWeight = 'bold';
    range2.label.text = this.average.toString();
    this.range2 = range2;

    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'message_date';
    series.name =  this.property;
    series.stroke = '#1A5A9E';
    series.yAxis = valueYAxis;
    series.dataFields.valueY =  this.property;
    series.compareText = true;
    series.strokeWidth = 1.5;
    series.strokeOpacity = 1;
    series.connect = true;
    series.fillOpacity = 0;

    const bullet = series.bullets.push(new am4charts.CircleBullet());
    bullet.stroke = '#1A5A9E';
    bullet.strokeWidth = 2;
    bullet.circle.radius = 1;

    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    this.valueAxis = valueYAxis;

  }


  ngOnDestroy(): void {
      if (this.chart) {
        this.chart.dispose();
      }
      this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
