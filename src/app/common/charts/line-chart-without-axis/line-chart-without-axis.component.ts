import { Subscription } from 'rxjs';
import { Component, Input, NgZone, OnInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { ChartService } from 'src/app/services/chart/chart.service';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';

declare var $: any;
@Component({
  selector: 'app-line-chart-without-axis',
  templateUrl: './line-chart-without-axis.component.html',
  styleUrls: ['./line-chart-without-axis.component.css'],
})
export class LineChartWithoutAxisComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() chartId: string;
  @Input() property: string;
  @Input() telemetryObj;
  @Input() chartConfig: any;
  private chart: am4charts.XYChart;
  min = 0;
  max = 100;
  average: number;
  range0: any;
  range1: any;
  range2: any;
  valueAxis: any;
  subscriptions: Subscription[] = [];

  constructor(private chartService: ChartService, private zone: NgZone) {}

  ngOnInit(): void {
    console.log(this.chartConfig.noOfDataPointsForTrend);
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        if (this.chart) {
          this.chart.data = JSON.parse(JSON.stringify([]));
          this.chart.invalidateData();
        }
      })
    );
  }

  ngAfterViewInit() {
    this.plotChart();
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj && this.chart) {
      // const data = JSON.parse(JSON.stringify(this.chart.data));
      let valueArr = [];
      const newObj = {
        message_date: new Date(this.telemetryObj[this.property]?.date),
      };
      newObj[this.property] = this.telemetryObj[this.property]?.value;
      this.chart.data.push(newObj);
      console.log(this.chart.data);
      valueArr = this.chart.data.map((a) => a[this.property]);
      if (valueArr.length > 0) {
        this.max = Math.ceil(valueArr.reduce((a, b) => Math.max(a, b)));
        this.min = Math.floor(valueArr.reduce((a, b) => Math.min(a, b)));

        if (this.min === this.max) {
          this.min = this.min - 5;
          this.max = this.max + 5;
        }
        console.log(this.min);
        console.log(this.max);
        this.average = Number(((this.min + this.max) / 2).toFixed(1));
        console.log(this.average);
        this.valueAxis.min = this.min;
        this.valueAxis.max = this.max;
        this.range0.value = this.min;
        this.range1.value = this.max;
        this.range2.value = this.average;
        this.range0.label.text = this.min.toString();
        this.range1.label.text = this.max.toString();
        this.range2.label.text = this.average.toString();
        this.range1.grid.disabled = this.min === this.max;
        this.range2.grid.disabled = this.min + this.max === this.average * 2;
      }
      if (this.chart.data.length >= this.chartConfig.noOfDataPointsForTrend) {
        this.chart.data.splice(0, 1);
      }
      this.chart.validateData();
    }
  }

  plotChart() {
    this.zone.runOutsideAngular(() => {
      am4core.options.autoDispose = true;
      const chart = am4core.create(this.chartId, am4charts.XYChart);
      const data = [];
      if (this.telemetryObj[this.property]?.value !== undefined && this.telemetryObj[this.property]?.value !== null) {
        const newObj = {
          message_date: new Date(this.telemetryObj[this.property]?.date),
        };
        newObj[this.property] = this.telemetryObj[this.property]?.value;
        data.push(newObj);
      }
      if (this.telemetryObj[this.property]?.value !== null && this.telemetryObj[this.property]?.value !== undefined) {
        this.max = Number(this.telemetryObj[this.property]?.value);
        this.min = Number(this.telemetryObj[this.property]?.value);
        if (this.min === this.max) {
          this.min = this.min - 5;
          this.max = this.max + 5;
        }
        this.average = Number(((this.min + this.max) / 2).toFixed(1));
      }
      chart.data = data;
      console.log(JSON.stringify(data));
      chart.logo.disabled = true;
      chart.marginLeft = -100;
      chart.dateFormatter.inputDateFormat = 'x';
      chart.dateFormatter.dateFormat = 'dd-MMM-yyyy HH:mm:ss.nnn';
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.hidden = true;
      this.createValueAxis(chart, 0);
      this.chart = chart;
    });
  }

  createValueAxis(chart, axis) {
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    if (chart.yAxes.indexOf(valueYAxis) !== 0) {
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
    range0.label.text = this.min?.toString();
    this.range0 = range0;

    const range1 = valueYAxis.axisRanges.create();
    range1.value = this.max;
    range1.label.fontSize = '0.6em';
    range1.label.fontWeight = 'bold';
    range1.label.text = this.max?.toString();
    this.range1 = range1;

    const range2 = valueYAxis.axisRanges.create();
    range2.value = this.average;
    range2.label.fontSize = '0.6em';
    range2.label.fontWeight = 'bold';
    range2.label.text = this.average?.toString();
    this.range2 = range2;

    const series = chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = 'message_date';
    series.name = this.property;
    series.stroke = '#1A5A9E';
    series.yAxis = valueYAxis;
    series.dataFields.valueY = this.property;
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
      console.log('in destroy');
      this.chart.dispose();
      console.log(this.chart);
    }
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
