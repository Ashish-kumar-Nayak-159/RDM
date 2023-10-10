import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/services/chart/chart.service';
import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;
@Component({
  selector: 'app-only-number-widget',
  templateUrl: './only-number-widget.component.html',
  styleUrls: ['./only-number-widget.component.css'],
})
export class OnlyNumberWidgetComponent implements OnInit, OnDestroy {
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
  widgetStringFromMenu: any;
  startPoint: any = {};

  constructor(private chartService: ChartService, private commonService: CommonService) { }

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);
    }
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        this.telemetryData = JSON.parse(JSON.stringify([]));
      })
    );

    setTimeout(() => {
      if (this.telemetryObj) {
        this.chartConfig.properties?.forEach(prop => {
          if (prop?.asset_id == this.telemetryObj?.asset_id) {
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date
          } else {
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date;
            prop.lastValue = this.telemetryObj[prop?.json_key]?.value;

          }
        })
      }

    }, 400);
  }

  convertToNumber(value) {
    return Number(value);
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj) {
      this.chartConfig.properties.forEach(prop => {
        if (changes.telemetryObj.currentValue != changes.telemetryObj.previousValue) {
          if (this.telemetryObj) {
            if (this.telemetryObj[prop?.composite_key]?.date) {

              if (!this.startPoint[prop.asset_id]) {
                this.startPoint[prop.composite_key] = new Date(this.telemetryObj[prop?.composite_key]?.date);
              }
              if (new Date(this.telemetryObj[prop?.composite_key]?.date) >= this.startPoint[prop.asset_id]) {
                if (prop?.composite_key == this.telemetryObj?.asset_id && this.telemetryObj[prop?.composite_key] &&
                  (this.telemetryObj[prop?.composite_key]?.value !== undefined
                    && this.telemetryObj[prop?.composite_key]?.value !== null)) {
                  if (prop?.data_type === 'Number') {
                    prop.lastValue = (this.convertToNumber(this.telemetryObj[prop?.composite_key]?.value))
                  }
                }
                if (prop?.composite_key == this.telemetryObj?.composite_key) {
                  prop.lastDate = this.telemetryObj[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date;
                  prop.lastValue = this.telemetryObj[prop?.composite_key]?.value;

                }
              }
            }
          }
        }
      });
    }
  }

  // ngOnChanges(changes) {
  //   if (changes.telemetryObj) {
  //     if (this.chartConfig.widgetType === 'NumberWithTrend' && this.chartConfig.noOfDataPointsForTrend > 0) {
  //       if (this.telemetryObj) {
  //         this.telemetryData.push(this.telemetryObj);
  //       }
  //       if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
  //         this.telemetryData.splice(0, 1);
  //       }
  //     }
  //   }
  //   if (changes.apiTelemetryObj) {
  //     if (this.chartConfig.widgetType === 'NumberWithTrend' && this.chartConfig.noOfDataPointsForTrend > 0) {
  //       if (this.apiTelemetryObj) {
  //         this.telemetryData.push(this.apiTelemetryObj);
  //       }
  //       if (this.telemetryData.length > this.chartConfig.noOfDataPointsForTrend) {
  //         this.telemetryData.splice(0, 1);
  //       }
  //     }
  //   }
  //   const arr = JSON.parse(JSON.stringify(this.telemetryData));
  //   this.telemetryData = JSON.parse(JSON.stringify([]));
  //   this.telemetryData = JSON.parse(JSON.stringify(arr));
  // }

  openConfirmRemoveWidgetModal() {
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.bodyMessage =
      'Are you sure you want to remove this ' + this.chartConfig.widgetTitle + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
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
