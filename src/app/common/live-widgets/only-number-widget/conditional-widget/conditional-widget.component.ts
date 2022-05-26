import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from '../../../../services/common.service';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;

@Component({
  selector: 'app-conditional-widget',
  templateUrl: './conditional-widget.component.html',
  styleUrls: ['./conditional-widget.component.css']
})
export class ConditionalWidgetComponent implements OnInit {
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

  constructor(private chartService: ChartService, private commonService: CommonService) { }

  ngOnInit(): void {
    console.log("Checkingasset", JSON.stringify(this.asset))
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    console.log("Checkingchartconfig", JSON.stringify(this.chartConfig))
    console.log("Telemetryobject", JSON.stringify(this.telemetryData))

    if (this.telemetryObj) {
      this.telemetryData.push(this.telemetryObj);
    }
    this.subscriptions.push(
      this.chartService.clearDashboardTelemetryList.subscribe((arr) => {
        this.telemetryData = JSON.parse(JSON.stringify([]));
      })
    );
  }

  convertToNumber(value) {
    return Number(value);
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

  evaluatePropConditionwithoutasset(telemetryObj,prop){
    let condition = prop.formula;
    try {
      prop.json_Data.forEach((jd, i) => {
        condition = condition.replaceAll(`%${i + 1}%`, `telemetryObj?.${jd.type}?.${jd.json_key}`);
      });
      var actualVal = eval(condition);
      if(actualVal)
       { return 'Yes';}
        return 'No'
    } catch (err) {
      console.log(err);
      return 'NA';
    }

  }

  evaluatePropCondition(telemetryObj){
    debugger
    let condition = this.chartConfig?.formula;
    try {
      this.chartConfig?.properties?.forEach((jd, i) => {
        condition = condition?.replaceAll(`%${i + 1}%`, telemetryObj[jd?.json_key]?.value);
      });
      var actualVal = eval(condition);
      if(actualVal)
       { return 'Yes';}
        return 'No'
    } catch (err) {
      return 'NA';
    }
  }

  removeChart(chartId) {
    this.removeWidget.emit(chartId);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }


}
