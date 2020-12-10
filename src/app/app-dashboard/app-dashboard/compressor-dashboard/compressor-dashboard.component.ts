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

  async onFilterSelection() {
    this.signalRService.disconnectFromSignalR();
    this.isTelemetryDataLoading = true;
    const obj = {
      device_id: this.filterObj.device.device_id,
      type: 'telemetry',
      hierarchy: {},
      levels: this.contextApp.hierarchy.levels
    };
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(obj.hierarchy);
    });
    this.signalRService.connectToSignalR(obj);
    this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
      data => {
        this.processTelemetryData(data);
        this.isTelemetryDataLoading = false;
      }
    );
  }

  processTelemetryData(telemetryObj) {
    console.log(moment(new Date(telemetryObj.timestamp).toString()).format('DD-MMM-YYYY hh:mm:ss A'));
    telemetryObj.message_date = this.commonService.convertSignalRUTCDateToLocal(telemetryObj.timestamp);
    this.lastReportedTelemetryValues = telemetryObj;
    console.log(telemetryObj);
    this.telemetryObj = telemetryObj;
    if (this.telemetryData.length >= 10) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.lastReportedTelemetryValues);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
    console.log(this.telemetryData);
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
