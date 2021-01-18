import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Device } from 'src/app/models/device.model';
import { GoogleChartInterface } from 'ng2-google-charts';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-live-data',
  templateUrl: './live-data.component.html',
  styleUrls: ['./live-data.component.css']
})
export class LiveDataComponent implements OnInit, OnDestroy {


  @Input() device = new Device();
  userData: any;
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  propertyList: any[] = [];
  liveWidgets: any[] = [];
  isGetLiveWidgetsAPILoading = false;
  selectedWidgets: any[] = [];
  signalRTelemetrySubscription: any;
  isTelemetryDataLoading = false;
  telemetryObj: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private signalRService: SignalRService
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
        name: this.device.tags.device_type
      };
      this.apiSubscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          resolve();
        }
      ));
    });
  }

  getLiveWidgets() {
    this.liveWidgets = [];
    const params = {
      app: this.contextApp.app,
      name: this.device.tags.device_type
    };
    this.deviceTypeService.getThingsModelLiveWidgets(params).subscribe(
      (response: any) => {
        if (response?.live_widgets?.length > 0) {
          response.live_widgets.forEach(widget => {
            this.liveWidgets.push({
              id: widget.widgetTitle,
              value: widget
            });
          });
        }
      }
    );
  }

  getTelemetryData() {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();
    const obj = {};
    this.isTelemetryDataLoading = true;
    this.telemetryObj = undefined;
    obj['app'] = this.contextApp.app;
    obj['device_type'] = this.device.tags.device_type;
    let message_props = '';
    obj['count'] = 1;
    const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    const now = (moment().utc()).unix();
    obj['from_date'] = midnight;
    obj['to_date'] = now;
    this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key
    + (this.propertyList[index + 1] ? ',' : ''));
    obj['message_props'] = message_props;

    this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          response.data[0].message_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
          this.telemetryObj = response.data[0];
          Object.keys(this.telemetryObj).forEach(key => {
            if (key !== 'message_date') {
              this.telemetryObj[key] = Number(this.telemetryObj[key]);
            }
          });
          this.isTelemetryDataLoading = false;
        } else {
          this.isTelemetryDataLoading = false;
        }
        const obj1 = {
          hierarchy: this.contextApp.user.hierarchy,
          levels: this.contextApp.hierarchy.levels,
          device_id: this.device.device_id,
          type: 'telemetry',
          app: this.contextApp.app
        };
        this.signalRService.connectToSignalR(obj1);
        this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
          data => {
            if (data.type !== 'alert') {
              this.telemetryObj = undefined;
              data.message_date = this.commonService.convertSignalRUTCDateToLocal(data.ts);
              this.telemetryObj = JSON.parse(JSON.stringify(data));
              this.isTelemetryDataLoading = false;
            }
          }
        );
    }, error => this.isTelemetryDataLoading = false));
  }

  onDeSelectAll() {
    this.selectedWidgets = [];
  }

  ngOnDestroy(): void {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
