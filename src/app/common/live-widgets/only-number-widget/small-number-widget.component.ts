import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonService } from './../../../services/common.service';
import { Subscription } from 'rxjs';
import { ChartService } from 'src/app/services/chart/chart.service';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;

@Component({
  selector: 'app-small-number-widget',
  templateUrl: './small-number-widget.component.html',
  styleUrls: ['./small-number-widget.component.css']
})
export class SmallNumberWidgetComponent implements OnInit {
  isString(value: any): boolean {
    return typeof value === 'string';
  }
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
  contextApp: any;
  currentDate: string;

  constructor(private chartService: ChartService, private commonService: CommonService) { }


  ngOnChanges(changes) {
    if (changes.telemetryObj) {
      this.chartConfig.properties.forEach((prop, cIndex) => {
        this.refreshLatestTelemetryInChart(prop);
      });
    }
  }

  refreshLatestTelemetryInChart(prop: any) {
    this.currentDate = this.commonService.convertUTCDateToLocalDate(new Date().toISOString(), CONSTANTS.DEFAULT_DATETIME_STR_FORMAT);
    const compositeKey = prop.composite_key;
    if (this.telemetryObj.hasOwnProperty(compositeKey)) {
      if (!this.telemetryObj || !this.telemetryObj.hasOwnProperty(compositeKey) || (
        this.telemetryObj[compositeKey].hasOwnProperty('date') &&
        this.telemetryObj[compositeKey].hasOwnProperty('date') &&
        this.telemetryObj[compositeKey].date < this.telemetryObj[compositeKey].date &&
        this.telemetryObj[compositeKey].hasOwnProperty('value') &&
        this.telemetryObj[compositeKey]['value'] !== undefined &&
        this.telemetryObj[compositeKey]['value'] !== null)) {
        if (!this.telemetryObj) this.telemetryObj = {};
        if (prop?.data_type === 'Number' && prop.hasOwnProperty('digitsAfterDecimals')) this.telemetryObj[compositeKey].value = this.telemetryObj[compositeKey].value.toFixed(prop.digitsAfterDecimals);
        this.telemetryObj[compositeKey] = this.telemetryObj[compositeKey];
      }
    }
  }

  async ngOnInit() {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
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
        this.chartConfig.properties.forEach((prop, cIndex) => {
          this.refreshLatestTelemetryInChart(prop);
        });
      }
    }, 400);
  }


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
  convertToNumber(value) {
    return Number(value);
  }

}
