import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-only-number-widget',
  templateUrl: './only-number-widget.component.html',
  styleUrls: ['./only-number-widget.component.css']
})
export class OnlyNumberWidgetComponent implements OnInit, OnChanges {

  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  telemetryData: any[] = [];
  blobToken = environment.blobKey;
  constructor() { }

  ngOnInit(): void {
    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);
    }
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj) {
      if (this.chartConfig.widgetType === 'NumberWithTrend' && this.chartConfig.noOfDataPointsForTrend > 0) {
        if (this.telemetryObj) {
          this.telemetryData.push(this.telemetryObj);
        }
        if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
          console.log('beforeee   ', this.telemetryData[0].message_date);
          this.telemetryData.splice(0, 1);
          console.log('after   ', this.telemetryData[0].message_date);
        }
      }
    }
    const arr = JSON.parse(JSON.stringify(this.telemetryData));
    this.telemetryData = JSON.parse(JSON.stringify([]));
    this.telemetryData = JSON.parse(JSON.stringify(arr));
  }

  openConfirmRemoveWidgetModal() {

  }

}
