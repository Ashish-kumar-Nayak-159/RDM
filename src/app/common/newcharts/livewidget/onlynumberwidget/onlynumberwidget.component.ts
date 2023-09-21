import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/services/chart/chart.service';
import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-onlynumberwidget',
  templateUrl: './onlynumberwidget.component.html',
  styleUrls: ['./onlynumberwidget.component.css']
})
export class OnlynumberwidgetComponent implements OnInit, OnDestroy {
  @Input() chartConfig: any;
  @Input() telemetryObj: any;
  @Input() apiTelemetryObj: any;
  @Input() type: any;

  // @Output() removeWidget: EventEmitter<string> = new EventEmitter<string>();
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
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;
  chartId: any;
  startPoint: any = {};
  constructor(private chartService: ChartService, private commonService: CommonService) { }

  ngOnInit(): void {
    if (this.chartConfig) {
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
      this.chartConfig.properties = this.chartConfig.properties[0].properties;
    }

    if (!this.chartConfig?.noOfDataPointsForTrend) {
      this.chartConfig.noOfDataPointsForTrend = this.chartConfig.metadata?.noOfDataPointsForTrend;
    }



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
      if (this.type == 'LogicalView') {
        this.chartConfig.properties.forEach(prop => {
          if (this.telemetryObj) {
            if (prop?.asset_id == this.telemetryObj?.asset_id && this.telemetryObj[prop?.composite_key] &&
              (this.telemetryObj[prop?.composite_key]?.value !== undefined
                && this.telemetryObj[prop?.composite_key]?.value !== null)) {
              if (prop?.data_type === 'Number') {
                prop.lastValue = (this.convertToNumber(this.telemetryObj[prop?.composite_key]?.value)?.toFixed(prop.digitsAfterDecimals))
              }
              else {
                prop.lastValue = this.telemetryObj[prop?.composite_key]?.value
              }
            }
            else {
              prop.lastValue = this.telemetryObj[prop?.composite_key]?.value
            }
          }
          else {
            prop.lastValue = "NA"
          }
          if (prop?.asset_id == this.telemetryObj?.asset_id) {
            prop.lastDate = this.telemetryObj?.[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date
          } else {
            prop.lastDate = this.telemetryObj?.[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date || 'NA';

          }
          if (this.telemetryObj) {
            if (this.telemetryObj[prop?.composite_key]?.date)
              this.startPoint[prop.asset_id] = new Date(
                this.telemetryObj[prop?.composite_key]?.date
              );
          }


        });
      }
      if (this.telemetryObj && this.type !== 'LogicalView') {
        this.chartConfig.properties.forEach(prop => {
          if (prop?.asset_id == this.telemetryObj?.asset_id) {
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date
          } else {
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date;
            prop.lastValue = this.telemetryObj[prop?.json_key]?.value;

          }
        })
      }

    }, 400);


    // this.asset = { "asset_id": "c135f97" }
  }

  convertToNumber(value) {
    return Number(value);
  }

  ngAfterViewInit() {

  }

  ngOnChanges(changes) {
    if (changes.telemetryObj && this.type == 'LogicalView') {
      this.chartConfig.properties.forEach(prop => {
        if (changes.telemetryObj.currentValue != changes.telemetryObj.previousValue) {
          if (this.telemetryObj) {
            if (this.telemetryObj[prop?.composite_key]?.date) {

              if (!this.startPoint[prop.asset_id]) {
                this.startPoint[prop.asset_id] = new Date(this.telemetryObj[prop?.composite_key]?.date);
              }
              if (new Date(this.telemetryObj[prop?.composite_key]?.date) >= this.startPoint[prop.asset_id]) {
                if (prop?.asset_id == this.telemetryObj?.asset_id && this.telemetryObj[prop?.composite_key] &&
                  (this.telemetryObj[prop?.composite_key]?.value !== undefined
                    && this.telemetryObj[prop?.composite_key]?.value !== null)) {
                  if (prop?.data_type === 'Number') {
                    prop.lastValue = (this.convertToNumber(this.telemetryObj[prop?.composite_key]?.value))
                  }
                  // else {
                  //   console.log('111111111')
                  //   prop.lastValue = this.telemetryObj[prop?.composite_key]?.value
                  // }
                }
                if (prop?.asset_id == this.telemetryObj?.asset_id) {
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
  //     if (this.chartConfig.widget_type === 'NumberWithTrend' && this.chartConfig.metadata.noOfDataPointsForTrend > 0) {
  //       if (this.telemetryObj) {
  //         this.telemetryData.push(this.telemetryObj);
  //       }
  //       if (this.telemetryData.length > this.chartConfig.metadata.noOfDataPointsForTrend) {
  //         this.telemetryData.splice(0, 1);
  //       }
  //     }
  //   }
  //   if (changes.apiTelemetryObj) {
  //     if (this.chartConfig.widget_type === 'NumberWithTrend' && this.chartConfig.metadata.noOfDataPointsForTrend > 0) {
  //       if (this.apiTelemetryObj) {
  //         this.telemetryData.push(this.apiTelemetryObj);
  //       }
  //       if (this.telemetryData.length > this.chartConfig.metadata.noOfDataPointsForTrend) {
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
      'Are you sure you want to remove this ' + this.chartConfig.widget_title + ' ' + this.widgetStringFromMenu + '?';
    this.headerMessage = 'Remove ' + this.widgetStringFromMenu;
    $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal({
      backdrop: 'static',
      keyboard: false,
      show: true,
    });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal('hide');
    } else if (eventType === 'save') {
      this.removeWidget();
      $('#confirmRemoveWidgetModal' + this.chartConfig.chart_id).modal('hide');
    }
  }

  removeWidget() {
    this.onMenu(2);
  }

  onMenu(type) {
    if (type == 0) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Edit" });
    }
    else if (type == 1) {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Clone" });
    }
    else {
      this.chart_Id.emit({ widgetId: this.widgetId, type: "Delete" });
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
