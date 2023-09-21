import { Component, Input, OnChanges, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonService } from '../../../../services/common.service';
import { ChartService } from 'src/app/services/chart/chart.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
declare var $: any;

@Component({
  selector: 'app-conditionalwidget',
  templateUrl: './conditionalwidget.component.html',
  styleUrls: ['./conditionalwidget.component.css']
})
export class ConditionalwidgetComponent implements OnInit {
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

      let jsonArray = [];
      this.chartConfig.properties.forEach(element => {
        let jsonObj = {
          name: element.title,
          type: element.type,
          composite_key: element.composite_key,
          asset_id: element.asset_id,
        };
        jsonArray.push(jsonObj);
      });
      let obj = {
        "text": this.chartConfig.text,
        "formula": this.chartConfig.formula,
        "json_Data": jsonArray
      }
      this.chartConfig.properties = [obj];
      setTimeout(() => {


        this.chartConfig.properties[0].json_Data.forEach(prop => {
          if (prop?.asset_id == this.telemetryObj?.asset_id) {
            this.startPoint[prop.asset_id] = new Date(
              this.telemetryObj?.[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date
            );
            prop.lastDate = this.telemetryObj[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date
          } else {
            prop.lastDate = this.telemetryObj[prop?.composite_key]?.date || this.telemetryObj[prop?.composite_key]?.message_date
          }
        })

      }, 400);
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

  evaluatePropConditionwithoutasset(telemetryObj, prop) {
    let condition = prop.formula;
    try {
      prop.json_Data.forEach((jd, i) => {
        condition = condition.replaceAll(`%${i + 1}%`, `telemetryObj?.${jd.type}?.${jd.composite_key}`);
      });
      var actualVal = eval(condition);
      if (prop?.text && prop?.text.length > 0) {
        if (actualVal) { return prop?.text[0]; }
        return prop?.text[1];
      }
      return actualVal;
    } catch (err) {
      return 'NA';
    }

  }

  evaluatePropCondition(telemetryObj) {
    debugger
    let condition = this.chartConfig?.formula;
    try {
      this.chartConfig?.properties[0]?.json_Data.forEach((jd, i) => {
        condition = condition?.replaceAll(`%${i + 1}%`, telemetryObj[jd?.composite_key]?.value);
      });
      var actualVal = eval(condition);
      if (this.chartConfig?.metadata?.text && this.chartConfig?.metadata?.text.length > 0) {
        if (actualVal) { return this.chartConfig?.metadata?.text[0]; }
        return this.chartConfig?.metadata?.text[1];
      }
      return actualVal
      // return actualVal;
      // var actualVal = eval(condition);
      // if(actualVal)
      //  { return 'ON';}
      //   return 'OFF'
    } catch (err) {
      return this.chartConfig?.metadata?.text[1];
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
