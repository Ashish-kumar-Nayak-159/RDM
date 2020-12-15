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
  originalDevices: any[] = [];
  filterObj: any = {};
  propertyList: any[] = [];
  telemetryObj: any;
  telemetryData: any[] = [];
  refreshInterval: any;
  selectedTab = 'telemetry';
  lastReportedTelemetryValues: any;
  isTelemetryDataLoading = false;
  signalRTelemetrySubscription: any;
  isFilterSelected = false;
  midNightHour = 1033;
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
        this.onChangeOfHierarchy(index, false);
      }
      }
    });
    this.loadFromCache();
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION);
    if (item) {
      console.log(item);
      this.filterObj = item;
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        // console.log( this.filterObj.hierarchy);
        // console.log( this.filterObj.hierarchy[level]);
        this.configureHierarchy[index] = this.filterObj.device.hierarchy[level];
        if (this.filterObj.device.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
        }
      });
      this.onFilterSelection(this.filterObj);
    }
  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.device_id === c2.device_id : c1 === c2;
}

  async onChangeOfHierarchy(i, flag = true) {
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

    if (flag) {
      const hierarchyObj: any = { App: this.contextApp.app};
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
        console.log(hierarchyObj);
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.devices = JSON.parse(JSON.stringify(this.originalDevices));
      } else {
      const arr = [];
      this.devices = [];
      this.originalDevices.forEach(device => {
        let flag = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag = true;
          } else {
            flag = false;
          }
        });
        if (flag) {
          arr.push(device);
        }
      });
      this.devices = JSON.parse(JSON.stringify(arr));
      }
      if (this.devices?.length === 1) {
        this.filterObj.device = this.devices[0];
      }
      // await this.getDevices(hierarchyObj);
    }

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
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
            if (this.devices?.length === 1) {
              this.filterObj.device = this.devices[0];
            }
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
    if (type === 'telemetry') {
      this.loadFromCache();
    }
  }

  async onFilterSelection(filterObj) {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();

    this.commonService.setItemInLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION, filterObj);
    const obj = {...filterObj};
    let device_type: any;
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      device_type = obj.device.device_type;
      delete obj.device;
    } else {
      this.toasterService.showError('Device selection is required', 'View Live Telemetry');
      return;
    }
    this.isTelemetryDataLoading = true;
    if (device_type) {
      await this.getThingsModelProperties(device_type);
    }
    this.telemetryObj = undefined;
    this.lastReportedTelemetryValues = undefined;
    this.telemetryData = [];
    let message_props = '';
    obj.count = 1;
    const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    const now = (moment().utc()).unix();
    obj.from_date = midnight;
    obj.to_date = now;
    obj.app = this.contextApp.app;
    this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : ''));
    obj.message_props = message_props;
    this.isFilterSelected = true;
    this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          response.data[0].message_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
          this.telemetryObj = response.data[0];
          Object.keys(this.telemetryObj).forEach(key => {
            if (key !== 'message_date') {
              this.telemetryObj[key] = Number(this.telemetryObj[key]);
            }
          });
          this.lastReportedTelemetryValues = JSON.parse(JSON.stringify(this.telemetryObj));
          this.telemetryData = response.data;
          this.isTelemetryDataLoading = false;
        } else {
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
    if (this.telemetryData.length >= 15) {
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
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
  }

}
