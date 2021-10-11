import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/services/chart/chart.service';
import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-only-number-widget',
  templateUrl: './only-number-widget.component.html',
  styleUrls: ['./only-number-widget.component.css'],
})
export class OnlyNumberWidgetComponent implements OnInit, OnChanges, OnDestroy {
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
  telemetryData: any[] = [];
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  @Input() asset: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  bodyMessage: string;
  headerMessage: string;
  subscriptions: Subscription[] = [];
  decodedToken: any;
  constructor(private chartService: ChartService, private commonService: CommonService) {}

  ngOnInit(): void {
    console.log(this.chartConfig);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);
    }
    console.log(this.apiTelemetryObj);
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        this.telemetryData = JSON.parse(JSON.stringify([]));
      })
    );
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj) {
      if (this.chartConfig.widgetType === 'NumberWithTrend' && this.chartConfig.noOfDataPointsForTrend > 0) {
        if (this.telemetryObj) {
          this.telemetryData.push(this.telemetryObj);
        }
        if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
          this.telemetryData.splice(0, 1);
        }
      }
    }
    if (changes.apiTelemetryObj) {
      if (this.chartConfig.widgetType === 'NumberWithTrend' && this.chartConfig.noOfDataPointsForTrend > 0) {
        if (this.apiTelemetryObj) {
          this.telemetryData.push(this.apiTelemetryObj);
        }
        if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
          this.telemetryData.splice(0, 1);
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
      isDisplayCancel: true,
    };
    this.bodyMessage = 'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' widget?';
    this.headerMessage = 'Remove Widget';
    $('#confirmRemoveWidgetModal' + this.chartConfig.chartId).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
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
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
