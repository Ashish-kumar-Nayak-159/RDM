import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})
export class LineChartComponent implements OnInit {

  @Input() gaugeGoogleChartConfig: any;
  constructor() { }

  ngOnInit(): void {
    if (this.gaugeGoogleChartConfig) {
      const ccComponent = this.gaugeGoogleChartConfig.component;
      // force a redraw
      if (ccComponent) {
        ccComponent.draw();
      }
    }
  }

}
