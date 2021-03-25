import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/chart/chart.service';
import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-only-number-widget',
  templateUrl: './only-number-widget.component.html',
  styleUrls: ['./only-number-widget.component.css']
})
export class OnlyNumberWidgetComponent implements OnInit, OnChanges, OnDestroy {

  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  telemetryData: any[] = [];
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  @Input() device: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean; };
  bodyMessage: string;
  headerMessage: string;
  subscriptions: Subscription[] = [];
     constructor(
       private chartService: ChartService
     ) { }

  ngOnInit(): void {
    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);
    }
    this.subscriptions.push(this.chartService.clearDashboardTelemetryList.subscribe(arr => {
      this.telemetryData = JSON.parse(JSON.stringify([]));
    }));


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
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true
    };
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal({ backdrop: 'static', keyboard: false, show: true });
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
