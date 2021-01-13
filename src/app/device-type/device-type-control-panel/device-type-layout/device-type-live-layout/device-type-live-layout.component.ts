import { SignalRService } from './../../../../services/signalR/signal-r.service';
import { ToasterService } from './../../../../services/toaster.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import { DeviceService } from 'src/app/services/devices/device.service';

declare var $: any;
@Component({
  selector: 'app-device-type-live-layout',
  templateUrl: './device-type-live-layout.component.html',
  styleUrls: ['./device-type-live-layout.component.css']
})
export class DeviceTypeLiveLayoutComponent implements OnInit {

  @Input() deviceType: any;
  widgetObj: any;
  isCreateWidgetAPILoading = false;
  userData: any;
  contextApp: any;
  subscriptions: Subscription[] = [];
  propertyList: any[] = [];
  liveWidgets: any[] = [];
  isGetWidgetsAPILoading = false;
  signalRTelemetrySubscription: Subscription;
  telemetryObj: any;
  isTelemetryDataLoading: boolean;

  constructor(
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private deviceService: DeviceService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getThingsModelProperties();
    this.getLiveWidgets();
  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.deviceType.name
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          resolve();
        }
      ));
    });
  }

  getLiveWidgets() {
    const params = {
      app: this.contextApp.app,
      id: this.deviceType.id
    };
    this.liveWidgets = [];
    this.isGetWidgetsAPILoading = true;
    this.subscriptions.push(this.deviceTypeService.getThingsModelLiveWidgets(params).subscribe(
      async (response: any) => {
        if (response?.live_widgets?.length > 0) {
          this.liveWidgets = response.live_widgets;
          this.getTelemetryData();
          setInterval(() =>
          this.getTelemetryData(), 10000
          );
        }
        this.isGetWidgetsAPILoading = false;
      }, () => this.isGetWidgetsAPILoading = false
    ));
  }

  onWidgetTypeChange() {
    this.widgetObj.properties = [{}];
  }

  getTelemetryData() {
    this.telemetryObj = {};
    this.telemetryObj.message_date = moment().subtract(10, 'second').format('DD-MMM-YYYY hh:mm:ss A').toString();
    this.propertyList.forEach(prop => {
      this.telemetryObj[prop.json_key] = this.commonService.randomIntFromInterval(
        prop.json_model[prop.json_key].minValue ? prop.json_model[prop.json_key].minValue : 0,
        prop.json_model[prop.json_key].maxValue ? prop.json_model[prop.json_key].maxValue : 100
      );
    });

    // this.signalRService.disconnectFromSignalR('telemetry');
    // this.signalRTelemetrySubscription?.unsubscribe();

    // this.commonService.setItemInLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION, filterObj);
    // const obj = {};
    // this.isTelemetryDataLoading = true;
    // this.telemetryObj = undefined;
    // obj['app'] = this.contextApp.app;
    // obj['device_type'] = this.deviceType.name;

    // let message_props = '';
    // obj['count'] = 1;
    // const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    // const now = (moment().utc()).unix();
    // obj['from_date'] = midnight;
    // obj['to_date'] = now;
    // this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key
    // + (this.propertyList[index + 1] ? ',' : ''));
    // obj['message_props'] = message_props;

    // this.subscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
    //   (response: any) => {
    //     if (response?.data?.length > 0) {
    //       response.data[0].message_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
    //       this.telemetryObj = response.data[0];
    //       Object.keys(this.telemetryObj).forEach(key => {
    //         if (key !== 'message_date') {
    //           this.telemetryObj[key] = Number(this.telemetryObj[key]);
    //         }
    //       });
    //       this.isTelemetryDataLoading = false;
    //     } else {
    //       this.isTelemetryDataLoading = false;
    //     }
    //     const obj1 = {
    //       hierarchy: this.contextApp.user.hierarchy,
    //       levels: this.contextApp.hierarchy.levels,
    //       device_id: this.filterObj.device.device_id,
    //       type: 'telemetry',
    //       app: this.contextApp.app
    //     };
    //     this.signalRService.connectToSignalR(obj1);
    //     this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
    //       data => {
    //         if (data.type !== 'alert') {
    //           this.processTelemetryData(data);
    //           this.isTelemetryDataLoading = false;
    //         }
    //       }
    //     );
    // }, error => this.isTelemetryDataLoading = false));
  }

  onCloseAddWidgetModal() {
    $('#addWidgetsModal').modal('hide');
    this.widgetObj = undefined;
  }

  onOpenAddWidgetModal() {
    this.widgetObj = {
      properties: [{}]
    };
    $('#addWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onSaveWidgetObj() {
    this.isCreateWidgetAPILoading = true;
    console.log(JSON.stringify(this.widgetObj));
    this.widgetObj.chartId = 'chart_' + moment().utc().unix();
    const arr = this.liveWidgets;
    arr.push(this.widgetObj);
    this.deviceType.live_widgets = arr;
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(this.deviceType, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Add Live Widgets');
        this.getLiveWidgets();
        this.onCloseAddWidgetModal();
        this.isCreateWidgetAPILoading = false;
      },
      (err) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(err.message, 'Add Live Widgets');
      }
    ));
  }

}
