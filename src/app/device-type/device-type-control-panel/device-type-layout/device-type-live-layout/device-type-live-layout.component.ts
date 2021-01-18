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
  configureDashboardWidgets: any[] = [];

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
  }

  onSaveConfigureDashboardWidgets() {
    this.isCreateWidgetAPILoading = true;
    this.updateDeviceType(this.configureDashboardWidgets, 'Dashboard configured successfully');
  }

  onCloseAddWidgetModal() {
    $('#addWidgetsModal').modal('hide');
    this.widgetObj = undefined;
  }

  onCloseConfigureDashboardModal() {
    $('#configureDashboardWidgetsModal').modal('hide');
    this.configureDashboardWidgets = [];
  }

  onOpenAddWidgetModal() {
    this.widgetObj = {
      properties: [{}]
    };
    $('#addWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onOpenConfigureDashboardModal() {
    this.configureDashboardWidgets = JSON.parse(JSON.stringify(this.liveWidgets));
    $('#configureDashboardWidgetsModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  removeWidget(chartId) {
    const arr = JSON.parse(JSON.stringify(this.liveWidgets));
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].chartId === chartId) {
        console.log('DOM not found', arr[i]);
        arr.splice(i, 1);
      }
    }
    this.liveWidgets = JSON.parse(JSON.stringify(arr));
    this.updateDeviceType(this.liveWidgets, 'Widget removed successfully.');
  }

  updateDeviceType(arr, message) {
    this.deviceType.live_widgets = arr;
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(this.deviceType, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(message, 'Live Widgets');
        this.getLiveWidgets();
        this.onCloseAddWidgetModal();
        this.onCloseConfigureDashboardModal();
        this.isCreateWidgetAPILoading = false;
      },
      (err) => {
        this.isCreateWidgetAPILoading = false;
        this.toasterService.showError(err.message, 'Add Live Widgets');
      }
    ));
  }

  onSaveWidgetObj() {
    this.isCreateWidgetAPILoading = true;
    console.log(JSON.stringify(this.widgetObj));
    this.widgetObj.chartId = 'chart_' + moment().utc().unix();
    const arr = this.liveWidgets;
    arr.push(this.widgetObj);
    this.updateDeviceType(arr, 'Widget added successfully.');
  }

}
