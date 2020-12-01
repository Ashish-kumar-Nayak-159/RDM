import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { DeviceService } from './../../../services/devices/device.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { resolve } from 'dns';

@Component({
  selector: 'app-compressor-dashboard',
  templateUrl: './compressor-dashboard.component.html',
  styleUrls: ['./compressor-dashboard.component.css']
})
export class CompressorDashboardComponent implements OnInit, OnDestroy {

  @Input() contextApp: any;

  hierarchyArr: any = {};
  configureHierarchy: any = {};
  devices: any[] = [];
  nonIPDevices: any[] = [];
  filterObj: any = {};
  propertyList: any[] = [];
  telemetryObj: any;
  refreshInterval: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService
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
        app: this.contextApp.app,
        hierarchy: JSON.stringify(hierarchy),
      };
      this.deviceService.getDeviceList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
          }
          resolve();
        }
      );
    });
  }

  onAssetSelection() {
    this.nonIPDevices = [];
    const hierarchyObj: any = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    if (this.filterObj.device?.cloud_connectivity.includes('Gateway')) {
      const obj = {
        app: this.contextApp.app,
        hierarchy: JSON.stringify(hierarchyObj),
      };
      this.deviceService.getNonIPDeviceList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.nonIPDevices = response.data;
          }
        }
      );
    }
  }

  async onFilterSelection() {
    const obj = {...this.filterObj};
    let device_type: any;
    if (obj.non_ip_device) {
      obj.gateway_id = obj.device.device_id;
      obj.device_id = obj.non_ip_device.device_id;
      device_type = obj.non_ip_device.device_type;
      delete obj.device;
      delete obj.non_ip_device;
    } else if (obj.device) {
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
    let message_props = '';
    obj.count = 1;
    obj.app = this.contextApp.app;
    this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : ''));
    obj.message_props = message_props;
    this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          this.telemetryObj = response.data[0];
          clearInterval(this.refreshInterval);
          this.refreshInterval = setInterval(() => {
            this.onFilterSelection();
          }, 5000);
        }
    });
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
