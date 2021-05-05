import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';
import { ChartService } from 'src/app/chart/chart.service';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ToasterService } from 'src/app/services/toaster.service';


@Component({
  selector: 'app-app-dashboard',
  templateUrl: './app-dashboard.component.html',
  styleUrls: ['./app-dashboard.component.css']
})
export class AppDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  defaultAppName = environment.app;
  userData: any;
  contextApp: any;
  tileData: any;
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
  isTelemetryModeAPICalled = false;
  originalFilter: any;
  apiSubscriptions: Subscription[] = [];
  liveWidgets: any[] = [];
  isGetWidgetsAPILoading = false;
  deviceDetailData: any;
  frequencyDiffInterval: number;
  normalModelInterval: number;
  turboModeInterval: number;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private chartService: ChartService,
    private route: ActivatedRoute  ) {
  }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app
        }
      ]
    });

    this.apiSubscriptions.push(this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          // this.selectedTab = fragment;
          this.onTabChange(fragment);
        } else {
          this.selectedTab = 'telemetry';
        }
    }));
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

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.page === 'Dashboard') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
  }

  ngAfterViewInit() {
    if ($('#overlay')) {
      $('#overlay').hide();
    }
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION);
    if (item && item.device) {
      this.originalFilter = JSON.parse(JSON.stringify(item));
      this.filterObj = JSON.parse(JSON.stringify(item));
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = item.device.hierarchy[level];
        if (item.device.hierarchy[level]) {
          this.onChangeOfHierarchy(index, true);
        }
        }
      });
      }
      this.onFilterSelection(this.filterObj);
    }
  }

  async onSwitchValueChange(event) {
    $('#overlay').show();
    // alert(this.signalRModeValue);
    this.c2dResponseMessage = [];
    this.signalRModeValue = event;
    this.isC2dAPILoading = true;

    // this.c2dLoadingMessage = 'Sending C2D Command';
    clearInterval(this.c2dResponseInterval);
    const obj = {
      method: 'change_device_mode',
      device_id: this.filterObj.device.device_id,
      gateway_id: this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : undefined,
      message: {
        telemetry_mode: this.signalRModeValue ? 'normal' : 'turbo',
        frequency_in_sec: this.signalRModeValue ?
        (this.deviceDetailData?.tags?.settings?.normal_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.normal_mode?.frequency : 60) :
        (this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency : 1),
        turbo_mode_timeout_in_sec : !this.signalRModeValue ?
        (this.deviceDetailData?.tags?.settings?.turbo_mode?.timeout_time ?
          this.deviceDetailData?.tags?.settings?.turbo_mode?.timeout_time : 120) : undefined,
        device_id: this.filterObj.device.device_id
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.filterObj.device.device_id + '_' + (moment().utc()).unix()
    };
    this.apiSubscriptions.push(this.deviceService.callDeviceMethod(obj, this.contextApp.app).subscribe(
      (response: any) => {
        // {"code":200,"device_response":{"gateway_id":"Gateway_Test_1","message":"Message received Successfully","timestamp":"2021-05-04T12:28:50.513Z"},"message":"Message received Successfully"}
        if (response?.device_response) {
        this.chartService.clearDashboardTelemetryList.emit([]);
        const arr = [];
        this.telemetryData = JSON.parse(JSON.stringify([]));
        this.telemetryData = JSON.parse(JSON.stringify(arr));
        this.toasterService.showSuccess(response.device_response.message, 'Change Telemetry Mode');
      }
        this.isC2dAPILoading = false;
        this.c2dLoadingMessage = undefined;
        this.telemetryInterval = undefined;
      }, error => {
        this.toasterService.showError(error.message, 'Change Telemetry Mode');
        this.signalRModeValue = !this.signalRModeValue;
        this.isC2dAPILoading = false;
        this.c2dLoadingMessage = undefined;
      }
    ));
  }

  getDeviceData() {
    return new Promise<void>((resolve1) => {
    this.deviceDetailData = undefined;

    this.apiSubscriptions.push(
      this.deviceService.getDeviceData
      (this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id :
        this.filterObj.device.device_id, this.contextApp.app).subscribe(
      async (response: any) => {
        this.deviceDetailData = JSON.parse(JSON.stringify(response));
        this.normalModelInterval = (this.deviceDetailData?.tags?.settings?.normal_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.normal_mode?.frequency : 60);
        this.turboModeInterval = (this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency : 1);
        this.frequencyDiffInterval = Math.abs((this.deviceDetailData?.tags?.settings?.normal_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.normal_mode?.frequency : 60) -
          (this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency ?
            this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency : 1));
        resolve1();
      }, error => this.isTelemetryDataLoading = false));
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
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.devices = JSON.parse(JSON.stringify(this.originalDevices));
      } else {
      const arr = [];
      this.devices = [];
      this.originalDevices.forEach(device => {
        let flag1 = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag1 = true;
          } else {
            flag1 = false;
          }
        });
        if (flag1) {
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
    let count = 0;
    Object.keys(this.configureHierarchy).forEach(key => {
      if (this.configureHierarchy[key]) {
        count ++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }

  }

  getDevices(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.apiSubscriptions.push(this.deviceService.getIPAndLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
            if (this.devices?.length === 1) {
              this.filterObj.device = this.devices[0];
            }
          }
          resolve1();
        }
      ));
    });

  }

  onTabChange(type) {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRService.disconnectFromSignalR('alert');
    this.telemetryData = JSON.parse(JSON.stringify([]));
    this.telemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.selectedTab = type;
    window.location.hash = type;
    this.filterObj.device = undefined;
    this.hierarchyArr = [];
    this.configureHierarchy = {};
    this.c2dResponseMessage = [];
    this.isC2dAPILoading = false;
    this.c2dLoadingMessage = undefined;
    clearInterval(this.c2dResponseInterval);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (type === 'telemetry') {
      this.loadFromCache();
    }
    $('#overlay').hide();
  }

  getLiveWidgets(deviceType) {
    return new Promise<void>((resolve1) => {
    const params = {
      app: this.contextApp.app,
      name: deviceType
    };
    this.liveWidgets = [];
    this.isGetWidgetsAPILoading = true;
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelLiveWidgets(params).subscribe(
      async (response: any) => {
        if (response?.live_widgets?.length > 0) {
          response.live_widgets.forEach(widget => {
            if (widget.dashboardVisibility) {
              this.liveWidgets.push(widget);
            }
          });
        }
        this.isGetWidgetsAPILoading = false;
        resolve1();
      }, () => {
        this.isGetWidgetsAPILoading = false;
        this.isTelemetryDataLoading = false;
      }
    ));
    });
  }

  async onFilterSelection(filterObj) {
    this.c2dResponseMessage = [];
    $('#overlay').hide();
    clearInterval(this.c2dResponseInterval);
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();

    this.commonService.setItemInLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION, filterObj);
    const obj = JSON.parse(JSON.stringify(filterObj));
    let device_type: any;
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      device_type = obj.device.device_type;
      delete obj.device;
    } else {
      this.toasterService.showError('Asset selection is required', 'View Live Telemetry');
      return;
    }
    this.originalFilter = JSON.parse(JSON.stringify(filterObj));
    this.isTelemetryDataLoading = true;
    await this.getDeviceSignalRMode(this.filterObj.device.device_id);
    await this.getDeviceData();
    if (device_type) {
      await this.getThingsModelProperties(device_type);
      await this.getLiveWidgets(device_type);
    }
    this.telemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.lastReportedTelemetryValues = undefined;
    this.telemetryData = JSON.parse(JSON.stringify([]));
    obj.count = 1;
    const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    const now = (moment().utc()).unix();
    obj.from_date = midnight;
    obj.to_date = now;
    obj.app = this.contextApp.app;
    obj.partition_key = this.filterObj.device.partition_key;
    delete obj.deviceArr;
    this.isFilterSelected = true;
    if (environment.app === 'SopanCMS') {
      await this.getMidNightHours(obj);
    }
    const obj1 = {
      hierarchy: this.contextApp.user.hierarchy,
      levels: this.contextApp.hierarchy.levels,
      device_id: this.filterObj?.device?.device_id,
      type: 'telemetry',
      app: this.contextApp.app,

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
    this.apiSubscriptions.push(this.deviceService.getLastTelmetry(this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (response?.message) {
          response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
          response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
          this.telemetryObj = response.message;
          // const hours = this.telemetryObj['Running Hours'].split(':');
          // this.telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
          // this.telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
          if (environment.app === 'SopanCMS') {
            this.getTimeDifference(
              Math.floor(Number(this.telemetryObj[this.getPropertyKey('Running Hours')])),
              Math.floor(Number(this.telemetryObj[this.getPropertyKey('Running Minutes')])));
          }
          this.lastReportedTelemetryValues = JSON.parse(JSON.stringify(this.telemetryObj));
          this.telemetryData = [];
          this.telemetryData.push(response.message);
          this.isTelemetryDataLoading = false;
        } else {
          this.isTelemetryDataLoading = false;
        }
    }, error => this.isTelemetryDataLoading = false));
  }

  processTelemetryData(telemetryObj) {

    telemetryObj.date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    telemetryObj.message_date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    if (environment.app === 'SopanCMS') {
      this.getTimeDifference(
        Math.floor(Number(telemetryObj[this.getPropertyKey('Running Hours')])),
        Math.floor(Number(telemetryObj[this.getPropertyKey('Running Minutes')])));
    }
    this.lastReportedTelemetryValues = telemetryObj;
    if (this.telemetryObj) {
      const interval = Math.round((moment(telemetryObj.message_date).diff(moment(this.telemetryObj.message_date), 'milliseconds')) / 1000);
      const diff1 = Math.abs(interval - this.normalModelInterval);
      const diff2 = Math.abs(interval - this.turboModeInterval);
      if (interval !== undefined && !this.isTelemetryModeAPICalled &&
        ((diff1 < diff2 && !this.signalRModeValue) || (diff1 > diff2 && this.signalRModeValue))) {
        this.isTelemetryModeAPICalled = true;
        setTimeout(() => {
        this.getDeviceSignalRMode(this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : this.filterObj.device.device_id);
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
  }


  getPropertyKey(name) {
    return this.propertyList.filter(prop => prop.name === name)[0]?.json_key || name;
  }

  getMidNightHours(filterObj) {
    return new Promise<void>((resolve1) => {
      const obj = {...filterObj};
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (prop.json_key === this.getPropertyKey('Running Hours') || prop.json_key === this.getPropertyKey('Running Minutes')) {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
        }
      });

      obj.message_props = message_props;
      obj.partition_key = this.filterObj?.device?.partition_key;
      this.apiSubscriptions.push(this.deviceService.getFirstTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
            this.midNightHour = response.message[this.getPropertyKey('Running Hours')] ?
            Math.floor(Number(response.message[this.getPropertyKey('Running Hours')])) : 0;
            this.midNightMinute = response.message[this.getPropertyKey('Running Minutes')] ?
            Math.floor(Number(response.message[this.getPropertyKey('Running Minutes')])) : 0;
            resolve1();
        }, error => this.isTelemetryDataLoading = false));
    });
  }

  getTimeDifference(hour, minute) {
    const midNightTime = (this.midNightHour * 60) + this.midNightMinute;
    const currentTime = (Number(hour) * 60) + Number(minute);
    const diff = currentTime - midNightTime;
    this.currentHour = Math.floor((diff / 60));
    this.currentMinute = diff - (this.currentHour * 60);
  }

  onAssetSelection() {
    if (this.filterObj?.deviceArr.length > 0) {
      this.filterObj.device = this.filterObj.deviceArr[0];
    } else {
      this.filterObj.device = undefined;
      this.filterObj.deviceArr = undefined;
    }
  }

  onAssetDeselect() {
    this.filterObj.device = undefined;
    this.filterObj.deviceArr = undefined;
  }

  getThingsModelProperties(deviceType) {
    return new Promise<void>((resolve1) => {
      if (this.propertyList.length === 0) {
        const obj = {
          app: this.contextApp.app,
          name: deviceType
        };
        this.apiSubscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
          (response: any) => {
            this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
            response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
            response.properties.derived_properties.forEach(prop => this.propertyList.push(prop));
            resolve1();
          }, error => this.isTelemetryDataLoading = false
        ));
      } else {
        resolve1();
      }
    });
  }

  getDeviceSignalRMode(deviceId) {
    // this.signalRModeValue = true;
    this.apiSubscriptions.push(this.deviceService.getDeviceSignalRMode(this.contextApp.app, deviceId).subscribe(
      (response: any) => {
        const newMode = response?.mode?.toLowerCase() === 'normal' ? true :
        (response?.mode?.toLowerCase() === 'turbo' ? false : true);
        if (this.signalRModeValue === newMode) {
          $('#overlay').hide();
          this.isC2dAPILoading = false;
          this.c2dResponseMessage = [];
          this.c2dLoadingMessage = undefined;
          clearInterval(this.c2dResponseInterval);
        } else {
          const arr = [];
          this.telemetryData = JSON.parse(JSON.stringify([]));
          this.chartService.clearDashboardTelemetryList.emit([]);
          this.telemetryData = JSON.parse(JSON.stringify(arr));
        }
        this.signalRModeValue = newMode;
        this.isTelemetryModeAPICalled = false;
      }, error => this.isTelemetryDataLoading = false
    ));
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    clearInterval(this.c2dResponseInterval);
    this.apiSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
