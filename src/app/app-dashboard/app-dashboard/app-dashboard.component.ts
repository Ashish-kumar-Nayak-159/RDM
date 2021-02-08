import { ChartService } from 'src/app/chart/chart.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class AppDashboardComponent implements OnInit {

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
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private chartService: ChartService,
    private cdr: ChangeDetectorRef  ) {
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

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.page === 'Dashboard') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
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
      console.log('aaaaaaaaaaaaaaa     ', item.device.hierarchy);
      this.originalFilter = JSON.parse(JSON.stringify(item));
      this.filterObj = JSON.parse(JSON.stringify(item));
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        // console.log( this.filterObj.hierarchy);
        // console.log( this.filterObj.hierarchy[level]);
        console.log(item);
        this.configureHierarchy[index] = item.device.hierarchy[level];
        if (item.device.hierarchy[level]) {
          this.onChangeOfHierarchy(index, true);
        }
        }
      });
      }

      console.log(this.filterObj);
      this.onFilterSelection(this.filterObj);
    }
  }

  async onSwitchValueChange(event) {
    console.log(event);
    $('#overlay').show();
    // alert(this.signalRModeValue);
    this.c2dResponseMessage = [];
    this.signalRModeValue = event;
    this.isC2dAPILoading = true;

    // this.c2dLoadingMessage = 'Sending C2D Command';
    clearInterval(this.c2dResponseInterval);
    const obj = {
      method: 'setTelemetryMode',
      device_id: this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : this.filterObj.device.device_id,
      gateway_id: this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : undefined,
      message: {
        mode: this.signalRModeValue ? 'normal' : 'turbo',
        frequency_in_sec: this.signalRModeValue ?
        (this.deviceDetailData?.tags?.settings?.normal_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.normal_mode?.frequency : 60) :
        (this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency ?
          this.deviceDetailData?.tags?.settings?.turbo_mode?.frequency : 1),
        turbo_mode_timeout_in_sec : !this.signalRModeValue ?
        (this.deviceDetailData?.tags?.settings?.turbo_mode?.timeout ?
          this.deviceDetailData?.tags?.settings?.turbo_mode?.timeout : 120) : undefined,
        device_id: this.filterObj.device.device_id
      },
      app: this.contextApp.app,
      timestamp: (moment().utc()).unix(),
      acknowledge: 'Full',
      expire_in_min: 1,
      message_id: this.filterObj.device.device_id + '_' + (moment().utc()).unix()
    };
    console.log(obj);
    this.apiSubscriptions.push(this.deviceService.callDeviceMethod(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response?.device_response?.configuration) {
        // this.c2dResponseMessage.push({
        //   timestamp: this.commonService.convertEpochToDate(obj.timestamp),
        //   message: 'Sent ' + (this.signalRModeValue ? 'Normal' : 'Turbo')  + ' mode command with '
        //   + obj.message.frequency_in_sec + ' second telemetry frequency to ' +
        // (this.filterObj.device.gateway_id ? 'IoT Gateway' : 'Device')
        // });
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
        // this.c2dResponseMessage.push({
        //   timestamp: this.commonService.convertEpochToDate(obj.timestamp),
        //   message: error.message});
        this.toasterService.showError(error.message, 'Change Telemetry Mode');
        this.signalRModeValue = !this.signalRModeValue;
        this.isC2dAPILoading = false;
        this.c2dLoadingMessage = undefined;
      }
    ));
  }

  getDeviceData() {
    return new Promise((resolve1) => {
    this.deviceDetailData = undefined;

    this.apiSubscriptions.push(
      this.deviceService.getDeviceData
      (this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id :
        this.filterObj.device.device_id, this.contextApp.app).subscribe(
      async (response: any) => {
        this.deviceDetailData = JSON.parse(JSON.stringify(response));
        resolve1();
      }));
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
      console.log(this.originalDevices);
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
      console.log('devicessss  ', arr);
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
    return new Promise((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.apiSubscriptions.push(this.deviceService.getAllDevicesList(obj, this.contextApp.app).subscribe(
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
    return new Promise((resolve1) => {
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
          })
        }
        this.isGetWidgetsAPILoading = false;
        resolve1();
      }, () => this.isGetWidgetsAPILoading = false
    ));
    });
  }

  async onFilterSelection(filterObj) {
    console.log('3722222222');
    this.c2dResponseMessage = [];
    $('#overlay').hide();
    clearInterval(this.c2dResponseInterval);
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();

    this.commonService.setItemInLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION, filterObj);
    const obj = JSON.parse(JSON.stringify(filterObj));
    console.log(obj);
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
    await this.getDeviceSignalRMode(this.filterObj.device.gateway_id ? this.filterObj.device.gateway_id : this.filterObj.device.device_id);
    await this.getDeviceData();
    if (device_type) {
      await this.getThingsModelProperties(device_type);
      await this.getLiveWidgets(device_type);
    }
    this.telemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.lastReportedTelemetryValues = undefined;
    this.telemetryData = JSON.parse(JSON.stringify([]));
    let message_props = '';
    obj.count = 1;
    const midnight =  ((((moment().hour(0)).minute(0)).second(0)).utc()).unix();
    const now = (moment().utc()).unix();
    obj.from_date = midnight;
    obj.to_date = now;
    // obj.app = this.contextApp.app;
    // this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : ''));
    // obj.message_props = message_props;
    this.isFilterSelected = true;
    // await this.getMidNightHours(obj);
    const obj1 = {
      hierarchy: this.contextApp.user.hierarchy,
      levels: this.contextApp.hierarchy.levels,
      device_id: this.filterObj?.device?.device_id,
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
    this.apiSubscriptions.push(this.deviceService.getLastTelmetry(this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (response?.message) {
          response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
          response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
          this.telemetryObj = response.message;
          // const hours = this.telemetryObj['Running Hours'].split(':');
          // this.telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
          // this.telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
          // this.getTimeDifference(
          //   Math.floor(Number(this.telemetryObj[this.getPropertyKey('Running Hours')])),
          //   Math.floor(Number(this.telemetryObj[this.getPropertyKey('Running Minutes')])));
      //    this.getTimeDifference(this.telemetryObj['Running Hours'], this.telemetryObj['Running Minutes']);


          // this.propertyList.forEach(prop => {
          //   if (prop.data_type === 'Number') {
          //     this.telemetryObj[prop.json_key] = Number(this.telemetryObj[prop.json_key]);
          //   }
          // });
          console.log(JSON.stringify(this.telemetryObj));
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
    // if (!this.midNightHour) {
    //   this.midNightHour = telemetryObj[this.getPropertyKey('Running Hours')] ?
    // Math.floor(Number(telemetryObj[this.getPropertyKey('Running Hours')])) : 0;
    //   this.midNightMinute = telemetryObj[this.getPropertyKey('Running Minutes')]
    // ? Math.floor(Number(telemetryObj[this.getPropertyKey('Running Minutes')])) : 0;
    // }
    // const hours = telemetryObj[this    .getPropertyKey('Running Hours')].toString().split(':');
    // telemetryObj['Hours'] = hours[0] ? Math.floor(Number(hours[0])) : 0;
    // telemetryObj['Minutes'] = hours[1] ? Math.floor(Number(hours[1])) : 0;
    // console.log(telemetryObj);
    // this.getTimeDifference(
    //   Math.floor(Number(telemetryObj[this.getPropertyKey('Running Hours')])),
    //   Math.floor(Number(telemetryObj[this.getPropertyKey('Running Minutes')])));
    this.lastReportedTelemetryValues = telemetryObj;
    if (this.telemetryObj) {
      const interval = Math.round((moment(telemetryObj.message_date).diff(moment(this.telemetryObj.message_date), 'milliseconds')) / 1000);
      // alert((this.telemetryInterval - 5) + ' aaaaa ' + interval + ' bbbbb ' + (this.telemetryInterval+ 5));
      if (this.telemetryInterval !== undefined && interval !== undefined &&
        Math.abs(this.telemetryInterval - interval) > 10 && !this.isTelemetryModeAPICalled) {
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
    // console.log(this.telemetryData);
    // this.cdr.detectChanges()
  }


  getPropertyKey(name) {
    return this.propertyList.filter(prop => prop.name === name)[0].json_key;
  }

  getMidNightHours(filterObj) {
    return new Promise((resolve1) => {
      const obj = {...filterObj};
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (prop.json_key === this.getPropertyKey('Running Hours') || prop.json_key === this.getPropertyKey('Running Minutes')) {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
        }
      });

      obj.message_props = message_props;
      this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
        (response: any) => {
          if (response?.data?.length > 0) {
            this.midNightHour = response.data[0][this.getPropertyKey('Running Hours')] ?
            Math.floor(Number(response.data[0][this.getPropertyKey('Running Hours')])) : 0;
            this.midNightMinute = response.data[0][this.getPropertyKey('Running Minutes')] ?
            Math.floor(Number(response.data[0][this.getPropertyKey('Running Minutes')])) : 0;
          }
          resolve1();
        }));
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
    return new Promise((resolve1) => {
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
          }
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
      }
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
