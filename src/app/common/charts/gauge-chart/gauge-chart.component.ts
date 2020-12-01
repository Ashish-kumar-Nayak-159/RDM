import { Component, OnInit } from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { constants } from 'fs';

@Component({
  selector: 'app-gauge-chart',
  templateUrl: './gauge-chart.component.html',
  styleUrls: ['./gauge-chart.component.css']
})
export class GaugeChartComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.loadChart();
  }

  loadChart() {
    const chartMin = -50;
    const chartMax = 100;



    const data = {
      score: 52.7,
      gradingData: [
        {
          title: 'Unsustainable',
          color: '#ee1f25',
          lowScore: -100,
          highScore: -20
        },
        {
          title: 'Volatile',
          color: '#f04922',
          lowScore: -20,
          highScore: 0
        },
        {
          title: 'Foundational',
          color: '#fdae19',
          lowScore: 0,
          highScore: 20
        },
        {
          title: 'Developing',
          color: '#f3eb0c',
          lowScore: 20,
          highScore: 40
        },
        {
          title: 'Maturing',
          color: '#b0d136',
          lowScore: 40,
          highScore: 60
        },
        {
          title: 'Sustainable',
          color: '#54b947',
          lowScore: 60,
          highScore: 80
        },
        {
          title: 'High Performing',
          color: '#0f9747',
          lowScore: 80,
          highScore: 100
        }
      ]
    };

    const chart = am4core.create('chartdiv', am4charts.GaugeChart);
    chart.hiddenState.properties.opacity = 0;
    chart.fontSize = 11;
    chart.innerRadius = am4core.percent(80);
    chart.resizable = true;

    /**
     * Normal axis
     */

    const axis = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    axis.min = chartMin;
    axis.max = chartMax;
    axis.strictMinMax = true;
    axis.renderer.radius = am4core.percent(80);
    axis.renderer.inside = true;
    axis.renderer.line.strokeOpacity = 0.1;
    axis.renderer.ticks.template.disabled = false;
    axis.renderer.ticks.template.strokeOpacity = 1;
    axis.renderer.ticks.template.strokeWidth = 0.5;
    axis.renderer.ticks.template.length = 5;
    axis.renderer.grid.template.disabled = true;
    axis.renderer.labels.template.radius = am4core.percent(15);
    axis.renderer.labels.template.fontSize = '0.9em';

    /**
     * Axis for ranges
     */

    const axis2 = chart.xAxes.push(new am4charts.ValueAxis<am4charts.AxisRendererCircular>());
    axis2.min = chartMin;
    axis2.max = chartMax;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = true;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = false;
    axis2.renderer.grid.template.opacity = 0.5;
    axis2.renderer.labels.template.bent = true;
    axis2.renderer.labels.template.fill = am4core.color('#000');
    axis2.renderer.labels.template.fontWeight = 'bold';
    axis2.renderer.labels.template.fillOpacity = 0.3;


    // for (const grading of data.gradingData) {
    //   const range = axis2.axisRanges.create();
    //   range.axisFill.fill = am4core.color(grading.color);
    //   range.axisFill.fillOpacity = 0.8;
    //   range.axisFill.zIndex = -1;
    //   range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
    //   range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
    //   range.grid.strokeOpacity = 0;
    //  // range.stroke = am4core.color(grading.color).lighten(-0.1);
    //   range.label.inside = true;
    //   range.label.text = grading.title.toUpperCase();
    //   range.label.inside = true;
    //   range.label.location = 0.5;
    //   range.label.inside = true;
    //   // range.label.radius = am4core.percent(10);
    //   range.label.paddingBottom = -5; // ~half font size
    //   range.label.fontSize = '0.9em';
    // }

    const matchingGrade = this.lookUpGrade(data.score, data.gradingData);

    /**
     * Label 1
     */

    const label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = '6em';
    label.x = am4core.percent(50);
    label.paddingBottom = 15;
    label.horizontalCenter = 'middle';
    label.verticalCenter = 'bottom';
    // label.dataItem = data;
    label.text = data.score.toFixed(1);
    // label.text = "{score}";
    label.fill = am4core.color(matchingGrade.color);

    /**
     * Label 2
     */

    const label2 = chart.radarContainer.createChild(am4core.Label);
    label2.isMeasured = false;
    label2.fontSize = '2em';
    label2.horizontalCenter = 'middle';
    label2.verticalCenter = 'bottom';
    label2.text = matchingGrade.title.toUpperCase();
    label2.fill = am4core.color(matchingGrade.color);

  }

  lookUpGrade(lookupScore, grades) {
    // Only change code below this line
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < grades.length; i++) {
      if (
        grades[i].lowScore < lookupScore &&
        grades[i].highScore >= lookupScore
      ) {
        return grades[i];
      }
    }
    return null;
  }
}
