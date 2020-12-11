import { CONSTANTS } from './../../../app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { DeviceService } from './../../../services/devices/device.service';
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { resolve } from 'dns';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import * as moment from 'moment';

@Component({
  selector: 'app-compressor-dashboard',
  templateUrl: './compressor-dashboard.component.html',
  styleUrls: ['./compressor-dashboard.component.css']
})
export class CompressorDashboardComponent implements OnInit, OnDestroy {

  @Input() contextApp: any;
  @Input() tileData: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  devices: any[] = [];
  nonIPDevices: any[] = [];
  filterObj: any = {};
  propertyList: any[] = [];
  telemetryObj: any;
  telemetryData: any[] = [];
  refreshInterval: any;
  selectedTab = 'telemetry';
  lastReportedTelemetryValues: any;
  isTelemetryDataLoading = false;
  signalRTelemetrySubscription: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app
        }
      ]
    });
    await this.getDevices(this.contextApp.user.hierarchy);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }

    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfHierarchy(index);
      }
      }
    });
  }

  async onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};
    const hierarchyObj: any = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    await this.getDevices(hierarchyObj);

  }

  getDevices(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.deviceService.getAllDevicesList(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
          }
          resolve();
        }
      );
    });
  }

  onTabChange(type) {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRService.disconnectFromSignalR('alert');
    this.telemetryData = [];
    this.telemetryObj = undefined;
    this.selectedTab = type;
    this.filterObj.device = undefined;
    this.hierarchyArr = [];
    this.configureHierarchy = {};
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
  }

  async onFilterSelection() {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.isTelemetryDataLoading = true;
    const obj = {...this.filterObj};
    let device_type: any;
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      device_type = obj.device.device_type;
      delete obj.device;
    }
    if (!obj.device_id) {
      this.toasterService.showError('Device selection is required', 'View Live Telemetry');
      return;
    }
    if (device_type) {
      await this.getThingsModelProperties(device_type);
    }
    this.telemetryObj = undefined;
    this.telemetryData = [];
    let message_props = '';
    obj.count = 1;
    obj.app = this.contextApp.app;
    this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : ''));
    obj.message_props = message_props;
    this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          response.data[0].message_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
          this.telemetryObj = response.data[0];
          this.lastReportedTelemetryValues = response.data[0];
          this.telemetryData = response.data;
          this.isTelemetryDataLoading = false;
        }
        const obj1 = {
          hierarchy: this.contextApp.user.hierarchy,
          levels: this.contextApp.hierarchy.levels,
          device_id: this.filterObj.device.device_id,
          type: 'telemetry',
          app: this.contextApp.app
        };
        this.signalRService.connectToSignalR(obj1);
        this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
          data => {
            if (data.type !== 'alert') {
              this.processTelemetryData(data);
              this.isTelemetryDataLoading = false;
            }
          }
        );
    }, error => this.isTelemetryDataLoading = false);
  }

  processTelemetryData(telemetryObj) {
    telemetryObj.message_date = this.commonService.convertSignalRUTCDateToLocal(telemetryObj.timestamp);
    console.log(telemetryObj.message_date)
    this.lastReportedTelemetryValues = telemetryObj;
    this.telemetryObj = telemetryObj;
    if (this.telemetryData.length >= 10) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.lastReportedTelemetryValues);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
    // console.log(this.telemetryData);
    // this.cdr.detectChanges()
  }

  getThingsModelProperties(deviceType) {
    return new Promise((resolve) => {
      if (this.propertyList.length === 0) {
        const obj = {
          app: this.contextApp.app,
          name: deviceType
        };
        this.deviceTypeService.getThingsModelProperties(obj).subscribe(
          (response: any) => {
            this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
            resolve();
          }
        );
      } else {
        resolve();
      }
    });

  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
  }

}
