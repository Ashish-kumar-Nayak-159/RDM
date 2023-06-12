import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/services/chart/chart.service';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;

@Component({
  selector: 'app-smallnumberwidget',
  templateUrl: './smallnumberwidget.component.html',
  styleUrls: ['./smallnumberwidget.component.css']
})
export class SmallnumberwidgetComponent implements OnInit {
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
  contextApp: any;
  @Output() chart_Id = new EventEmitter<any>();
  widgetId: any;
  chartId: any;
  startPoint: any = {};

  constructor(private chartService: ChartService, private commonService: CommonService) { }



  async ngOnInit() {

    if (this.chartConfig) {
      this.chartId = this.chartConfig.chart_Id;
      this.widgetId = this.chartConfig.id;
    }
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);

      if (this.telemetryObj && this.type == 'LogicalView') {
        this.chartConfig.properties.forEach(prop => {
          if (prop?.asset_id == this.telemetryObj?.asset_id && this.telemetryObj[prop?.json_key] &&
            (this.telemetryObj[prop?.json_key]?.value !== undefined
              && this.telemetryObj[prop?.json_key]?.value !== null)) {
            if (prop?.data_type === 'Number') {
              prop.lastValue = (this.convertToNumber(this.telemetryObj[prop?.json_key]?.value))
            }
            else {
              prop.lastValue = this.telemetryObj[prop?.json_key]?.value
            }
          }
          else {
            prop.lastValue = "NA"
          }

          if (prop?.asset_id == this.telemetryObj?.asset_id) {
            this.startPoint[prop.asset_id] = new Date(
              this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date
            );
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date
          }
        });
      }

    }
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        this.telemetryData = JSON.parse(JSON.stringify([]));
      })
    );
  }

  ngOnChanges(changes) {
    if (changes.telemetryObj && this.type == 'LogicalView') {
      this.chartConfig.properties.forEach(prop => {
        if (prop?.asset_id == this.telemetryObj?.asset_id && this.telemetryObj[prop?.json_key] &&
          (this.telemetryObj[prop?.json_key]?.value !== undefined
            && this.telemetryObj[prop?.json_key]?.value !== null)) {
          if (new Date(this.telemetryObj[prop?.json_key]?.date) > this.startPoint[prop.asset_id]) {
            if (prop?.data_type === 'Number') {
              prop.lastValue = (this.convertToNumber(this.telemetryObj[prop?.json_key]?.value))
            }
            else {
              prop.lastValue = this.telemetryObj[prop?.json_key]?.value
            }
          }
        }
        // else {
        //   prop.lastValue = "NA"
        // }

        if (prop?.asset_id == this.telemetryObj?.asset_id) {
          if (new Date(this.telemetryObj[prop?.json_key]?.date) > this.startPoint[prop.asset_id]) {
            prop.lastDate = this.telemetryObj[prop?.json_key]?.date || this.telemetryObj[prop?.json_key]?.message_date;
            this.startPoint[prop.asset_id] = prop.lastDate;
          }
        }
      });
    }
  }

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
  convertToNumber(value) {
    return Number(value);
  }

}
