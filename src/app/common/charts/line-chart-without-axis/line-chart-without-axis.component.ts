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
      this.telemetryData.forEach((obj, i) => {
        const newObj = {
          message_date: new Date(obj.message_date)
        };
        newObj[this.property] = obj[this.property];
        data.splice(data.length, 0, newObj);
      });
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
    valueYAxis.renderer.minWidth = 35;
    valueYAxis.hidden = true;
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
