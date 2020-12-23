import { CONSTANTS } from './../../../app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { DeviceService } from './../../../services/devices/device.service';
import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, AfterViewInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { resolve } from 'dns';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import * as moment from 'moment';

@Component({
  selector: 'app-compressor-dashboard',
  templateUrl: './compressor-dashboard.component.html',
  styleUrls: ['./compressor-dashboard.component.css']
})
export class CompressorDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

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
  midNightHour: number;
  midNightMinute: number;
  currentHour: number;
  currentMinute: number;
  telemetryInterval;
  signalRModeValue: boolean;
  c2dResponseMessage = [];
  c2dResponseInterval: any;
  isC2dAPILoading = false;
  c2dLoadingMessage: string;
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

  ngAfterViewInit() {
    if ($('.overlay')) {
      $('.overlay').hide();
    }
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
          this.onChangeOfHierarchy(index, true);
        }
        }
      });
      this.onFilterSelection(this.filterObj);
    }
  }

  onSwitchValueChange(event) {
    console.log(event)
    $('.overlay').show();
    // alert(this.signalRModeValue);
    this.c2dResponseMessage = [];
    this.signalRModeValue = event;
    this.isC2dAPILoading = true;
    this.c2dLoadingMessage = 'Sending C2D Command';
    clearInterval(this.c2dResponseInterval);
    const obj = {
      device_id: this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : this.filterObj.device.device_id,
      gateway_id: this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : undefined,
      message: {
        mode: this.signalRModeValue ? 'normal' : 'turbo',
        frequency_in_sec: this.signalRModeValue ? 60 : 1,
        device_id: this.filterObj.device.device_id
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.filterObj.device.device_id + '_' + (moment().utc()).unix()
    };
    console.log(obj);
    this.deviceService.changeTelemetryMode(obj, this.contextApp.app).subscribe(
      response => {
        this.c2dResponseMessage.push({
          timestamp: this.commonService.convertEpochToDate(obj.timestamp),
          message: 'Sent ' + (this.signalRModeValue ? 'Normal' : 'Turbo')  + ' mode command with '
          + obj.message.frequency_in_sec + ' second telemetry frequency to ' + (this.filterObj.device.gateway_id ? 'IoT Gateway' : 'Device')
        });
        this.c2dLoadingMessage = 'Waiting for resoponse from device';
        this.c2dResponseInterval = setInterval(() => {
          this.checkForC2dResponse(obj);
        }, 5000);
      }
    );
  }

  checkForC2dResponse(obj) {
    this.deviceService.getC2dResponseJSON(obj.message_id, this.contextApp.app).subscribe(
      (response: any) => {
        if (response.data?.length > 0) {
          this.isC2dAPILoading = false;
          this.c2dLoadingMessage = undefined;

          setTimeout(() => {
            $('.overlay').hide();
          }, 5000);
          this.c2dResponseMessage.push({
            timestamp: this.commonService.convertEpochToDate((moment().utc()).unix()),
          message: (this.filterObj.device.gateway_id ? 'IoT Gateway' : 'Device') + ' is successfully configured with '
          + obj.message.frequency_in_sec + ' second telemetry frequency'
          });
          clearInterval(this.c2dResponseInterval);
        }
      });
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
      console.log('devicessss  ', arr);
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
    this.c2dResponseMessage = [];
    clearInterval(this.c2dResponseInterval);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (type === 'telemetry') {
      this.loadFromCache();
    }
  }

  async onFilterSelection(filterObj) {
    this.c2dResponseMessage = [];
    $('.overlay').hide();
    clearInterval(this.c2dResponseInterval);
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
    await this.getDeviceSignalRMode(this.filterObj.device.gateway_id);
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
    await this.getMidNightHours(obj);

    this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          response.data[0].message_date = this.commonService.convertUTCDateToLocal(response.data[0].message_date);
          this.telemetryObj = response.data[0];
          // const hours = this.telemetryObj['Running Hours'].split(':');
          // this.telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
          // this.telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
          this.getTimeDifference( Math.floor(Number(this.telemetryObj['Running Hours'])),  Math.floor(Number(this.telemetryObj['Running Minutes'])));
      //    this.getTimeDifference(this.telemetryObj['Running Hours'], this.telemetryObj['Running Minutes']);
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

    if (!this.midNightHour) {
      this.midNightHour = telemetryObj['Running Hours'] ? Math.floor(Number(telemetryObj['Running Hours'])) : 0;
      this.midNightMinute = telemetryObj['Running Minutes'] ? Math.floor(Number(telemetryObj['Running Minutes'])) : 0;
    }
    // const hours = telemetryObj['Running Hours'].toString().split(':');
    // telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
    // telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
    // console.log(telemetryObj);
    this.getTimeDifference( Math.floor(Number(telemetryObj['Running Hours'])),  Math.floor(Number(telemetryObj['Running Minutes'])));
    this.lastReportedTelemetryValues = telemetryObj;
    if (this.telemetryObj) {
      const interval = moment(telemetryObj.message_date).diff(moment(this.telemetryObj.message_date), 'second');
      // alert((this.telemetryInterval - 5) + ' aaaaa ' + interval + ' bbbbb ' + (this.telemetryInterval+ 5));
      if (this.telemetryInterval && interval && Math.abs(this.telemetryInterval - interval) > 5) {
        setTimeout(() => {
        this.getDeviceSignalRMode(this.filterObj.device.gateway_id);
      }, 2000);
      }
      this.telemetryInterval = interval;
    }
    this.telemetryObj = telemetryObj;
    if (this.telemetryData.length >= 15) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.lastReportedTelemetryValues);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
    // console.log(this.telemetryData);
    // this.cdr.detectChanges()
  }

  getMidNightHours(filterObj) {
    return new Promise((resolve) => {
      const obj = {...filterObj};
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (prop.json_key === 'Running Hours' || prop.json_key === 'Running Minutes') {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '')
        }
      });

      obj.message_props = message_props;
      this.deviceService.getDeviceTelemetry(obj).subscribe(
        (response: any) => {
          if (response?.data?.length > 0) {
            this.midNightHour = response.data[0]['Running Hours'] ? Math.floor(Number(response.data[0]['Running Hours'])) : 0;
            this.midNightMinute = response.data[0]['Running Minutes'] ? Math.floor(Number(response.data[0]['Running Minutes'])) : 0;
          }
          resolve();
        });
    });
  }

  getTimeDifference(hour, minute) {
    console.log(this.midNightHour, '===', this.midNightMinute);
    console.log(hour, '===', minute);
    const midNightTime = (this.midNightHour * 60) + this.midNightMinute;
    const currentTime = (Number(hour) * 60) + Number(minute);
    console.log(midNightTime);
    console.log(currentTime);
    const diff = currentTime - midNightTime;
    this.currentHour = Math.floor((diff / 60));
    console.log(this.currentHour);
    this.currentMinute = diff - (this.currentHour * 60);
    console.log(this.currentMinute);
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

  getDeviceSignalRMode(deviceId) {
    this.signalRModeValue = true;
    this.deviceService.getDeviceSignalRMode(this.contextApp.app, deviceId).subscribe(
      (response: any) => {
        this.signalRModeValue = response?.mode?.toLowerCase() === 'normal' ? true :
        (response?.mode?.toLowerCase() === 'turbo' ? false : true);
      }
    )
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    clearInterval(this.c2dResponseInterval);
  }

}
