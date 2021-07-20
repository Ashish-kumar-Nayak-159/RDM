import { ActivatedRoute } from '@angular/router';
import { environment } from './../../../environments/environment';
import { ChartService } from 'src/app/chart/chart.service';
import { Component, OnDestroy, OnInit, AfterViewInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ToasterService } from 'src/app/services/toaster.service';

declare var $: any;
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
  assets: any[] = [];
  originalAssets: any[] = [];
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
  assetDetailData: any;
  frequencyDiffInterval: number;
  normalModelInterval: number;
  turboModeInterval: number;
  widgetPropertyList: any[] = [];
  previousProperties = [];
  sampleCountArr = Array(60).fill(0);
  sampleCountValue = 0;
  sampleCountInterval: any;
  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private chartService: ChartService,
    private route: ActivatedRoute  ) {
  }

  async ngOnInit(): Promise<void> {

    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    await this.getAssets(this.contextApp.user.hierarchy);
    this.onTabChange();

    // if (this.selectedTab === 'telemetry') {
    //   this.loadFromCache();
    // }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.page === 'Live Data') {
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

  onAssetFilterBtnClick() {
    $('.dropdown-menu').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
    // $('#dd-open').on('hide.bs.dropdown', (e: any) => {
    //   if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
    //     e.preventDefault();
    //   }
    // });
  }

  onSaveHierachy() {
  }

  onClearHierarchy() {
    this.hierarchyArr = {};
    this.configureHierarchy = {};
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    console.log(this.hierarchyArr);
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
      console.log(this.configureHierarchy);
      console.log(level);
      console.log(this.contextApp.user.hierarchy);
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfHierarchy(index, false);
      }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      if (item.assets) {
      this.filterObj.asset = item.assets;
      this.originalFilter = JSON.parse(JSON.stringify(this.filterObj));
      }
      if (item.hierarchy) {
        if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
        this.contextApp.hierarchy.levels.forEach((level, index) => {
          if (index !== 0) {
          this.configureHierarchy[index] = item.hierarchy[level];
          if (item.hierarchy[level]) {
            this.onChangeOfHierarchy(index, true, false);
          }
          }
        });
        }
      }
      if (this.filterObj.asset) {
        this.onFilterSelection(this.filterObj, false);
      }
    }
  }

  async onSwitchValueChange(event) {
    $('#overlay').show();
    this.c2dResponseMessage = [];
    this.signalRModeValue = event;
    this.isC2dAPILoading = true;
    clearInterval(this.c2dResponseInterval);
    const obj = {
      method: 'change_asset_mode',
      asset_id: this.filterObj.asset.asset_id,
      gateway_id: this.filterObj.asset.gateway_id ? this.filterObj.asset.gateway_id : undefined,
      message: {
        telemetry_mode: this.signalRModeValue ? 'normal' : 'turbo',
        asset_id: this.filterObj.asset.asset_id
      },
      app: this.contextApp.app,
      job_type: 'DirectMethod',
      request_type: 'change_asset_mode',
      job_id: this.filterObj.asset.asset_id + '_' + this.commonService.generateUUID(),
      sub_job_id: null
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.apiSubscriptions.push(this.assetService.callAssetMethod(obj, this.contextApp.app,
      this.filterObj?.asset?.gateway_id || this.filterObj?.asset?.asset_id).subscribe(
      (response: any) => {
        if (response?.asset_response) {
        this.chartService.clearDashboardTelemetryList.emit([]);
        const arr = [];
        this.telemetryData = JSON.parse(JSON.stringify([]));
        this.telemetryData = JSON.parse(JSON.stringify(arr));
        this.toasterService.showSuccess(response.asset_response.message, 'Change Telemetry Mode');
      }
        this.isC2dAPILoading = false;
        this.c2dLoadingMessage = undefined;
        this.telemetryInterval = undefined;
      }, error => {
        this.toasterService.showError(error?.message, 'Change Telemetry Mode');
        this.signalRModeValue = !this.signalRModeValue;
        this.isC2dAPILoading = false;
        this.c2dLoadingMessage = undefined;
      }
    ));
  }

  getAssetData() {
    return new Promise<void>((resolve1) => {
    this.assetDetailData = undefined;

    this.apiSubscriptions.push(
      this.assetService.getAssetDetailById
      (this.contextApp.app, this.filterObj.asset.asset_id).subscribe(
      async (response: any) => {
        this.assetDetailData = JSON.parse(JSON.stringify(response));
        this.normalModelInterval = (this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency ?
          this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency : 60);
        this.turboModeInterval = (this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency ?
          this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency : 1);
        this.frequencyDiffInterval = Math.abs((this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency ?
          this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency : 60) -
          (this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency ?
            this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency : 1));
        resolve1();
      }, error => this.isTelemetryDataLoading = false));
    });
  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.asset_id === c2.asset_id : c1 === c2;
  }

  async onChangeOfHierarchy(i, flag, persistAssetSelection = true) {
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
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      } else {
      const arr = [];
      this.assets = [];
      this.originalAssets.forEach(asset => {
        let flag1 = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag1 = true;
          } else {
            flag1 = false;
          }
        });
        if (flag1) {
          arr.push(asset);
        }
      });
      this.assets = JSON.parse(JSON.stringify(arr));
      }
      if (this.assets?.length === 1) {
        this.filterObj.asset = this.assets[0];
      }
      if (persistAssetSelection) {
      this.filterObj.assetArr = undefined;
      this.filterObj.asset = undefined;
      }
      // await this.getAssets(hierarchyObj);
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

  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.apiSubscriptions.push(this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.assets = response.data;
            this.originalAssets = JSON.parse(JSON.stringify(this.assets));
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
            }
          }
          resolve1();
        }
      ));
    });

  }

  onTabChange() {
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRService.disconnectFromSignalR('alert');
    this.telemetryData = JSON.parse(JSON.stringify([]));
    this.telemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.filterObj.asset = undefined;
    this.hierarchyArr = [];
    this.configureHierarchy = {};
    this.widgetPropertyList = [];
    this.c2dResponseMessage = [];
    this.isC2dAPILoading = false;
    this.c2dLoadingMessage = undefined;
    clearInterval(this.c2dResponseInterval);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.loadFromCache();
    $('#overlay').hide();
  }

  getLiveWidgets(assetModel) {
    return new Promise<void>((resolve1) => {
    const params = {
      app: this.contextApp.app,
      name: assetModel
    };
    this.liveWidgets = [];
    this.isGetWidgetsAPILoading = true;
    this.apiSubscriptions.push(this.assetModelService.getThingsModelLiveWidgets(params).subscribe(
      async (response: any) => {
        if (response?.live_widgets?.length > 0) {
          response.live_widgets.forEach(widget => {
            widget.derived_props = false;
            widget.measured_props = false;
            // widget.properties.forEach(prop => {
            //   if (prop.property.type === 'Derived Properties') {
            //     widget.derived_props = true;
            //   } else {
            //     widget.measured_props = true;
            //   }
            // });
            if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart') {
              widget?.properties.forEach(prop => {
                this.addPropertyInList(prop.property);
                if (prop?.property?.type === 'Derived Properties') {
                  widget.derived_props = true;
                } else {
                  widget.measured_props = true;
                }
              });
              } else {
                widget?.y1AxisProps.forEach(prop => {
                  this.addPropertyInList(prop);
                  if (prop?.type === 'Derived Properties') {
                    widget.derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                });
                widget?.y2AxisProps.forEach(prop => {
                  this.addPropertyInList(prop);
                  if (prop?.type === 'Derived Properties') {
                    widget.derived_props = true;
                  } else {
                    widget.measured_props = true;
                  }
                });
              }
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

  addPropertyInList(prop) {
    if (this.widgetPropertyList.length === 0 ) {
      this.widgetPropertyList.push(prop);
    } else {
      const index = this.widgetPropertyList.findIndex(propObj => propObj.json_key === prop.json_key);
      if (index === -1) {
        this.widgetPropertyList.push(prop);
      }
    }
  }

  async onFilterSelection(filterObj, updateFilterObj = true) {
    console.log('aaaaaa   ', filterObj);
    this.c2dResponseMessage = [];
    $('#overlay').hide();
    clearInterval(this.c2dResponseInterval);
    this.signalRService.disconnectFromSignalR('telemetry');
    this.signalRTelemetrySubscription?.unsubscribe();
    clearInterval(this.sampleCountInterval);

    // this.commonService.setItemInLocalStorage(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION, filterObj);
    const obj = JSON.parse(JSON.stringify(filterObj));
    let asset_model: any;
    if (obj.asset) {
      obj.asset_id = obj.asset.asset_id;
      asset_model = obj.asset.asset_model;
      delete obj.asset;
    } else {
      this.toasterService.showError('Asset selection is required', 'View Live Telemetry');
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = filterObj.asset.hierarchy;
      pagefilterObj['assets'] = filterObj.asset;
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    this.originalFilter = JSON.parse(JSON.stringify(filterObj));
    this.isTelemetryDataLoading = true;
    await this.getAssetSignalRMode(this.filterObj.asset.asset_id);
    await this.getAssetData();
    if (asset_model) {
      await this.getThingsModelProperties(asset_model);
      await this.getLiveWidgets(asset_model);
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
    obj.partition_key = this.filterObj.asset.partition_key;
    delete obj.assetArr;
    this.isFilterSelected = true;
    if (environment.app === 'SopanCMS') {
      await this.getMidNightHours(obj);
    }
    const obj1 = {
      hierarchy: this.contextApp.user.hierarchy,
      levels: this.contextApp.hierarchy.levels,
      asset_id: this.filterObj?.asset?.asset_id,
      type: 'telemetry',
      app: this.contextApp.app,

    };
    this.signalRService.connectToSignalR(obj1);
    this.signalRTelemetrySubscription = this.signalRService.signalRTelemetryData.subscribe(
      data => {
        if (data.type !== 'alert') {
          if (data) {
            let obj =  JSON.parse(JSON.stringify(data));
            delete obj.m;
            delete obj.d;
            obj = {...obj, ...data.m, ...data.d};
            data = JSON.parse(JSON.stringify(obj));
          }
          this.processTelemetryData(data);
          this.isTelemetryDataLoading = false;
        }
      }
    );
    this.apiSubscriptions.push(this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
      (response: any) => {
        if (response?.message) {
          response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
          response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
          const obj = {};
          // console.log(this.widgetPropertyList);
          this.widgetPropertyList.forEach(prop => {
            obj[prop?.json_key] = {
              value: response.message[prop?.json_key],
              date: response.message.message_date
            };
          });
          this.previousProperties = [];
          obj['previous_properties'] = [];
          // console.log(obj);
          this.telemetryObj = obj;
          // this.telemetryObj = response.message;
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
          this.telemetryData.push(this.telemetryObj);
          this.isTelemetryDataLoading = false;
        } else {
          this.isTelemetryDataLoading = false;
        }
        this.sampleCountInterval = setInterval(() => {
          this.sampleCountArr.pop();
          this.sampleCountArr.unshift(0);
          this.sampleCountValue = this.sampleCountArr.reduce((a, b) => a + b, 0);
        }, 1000);
    }, error => this.isTelemetryDataLoading = false));
  }

  processTelemetryData(telemetryObj) {
    telemetryObj.date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    telemetryObj.message_date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    this.sampleCountArr[0] = this.sampleCountArr[0] + 1;
    if (environment.app === 'SopanCMS') {
      this.getTimeDifference(
        Math.floor(Number(telemetryObj[this.getPropertyKey('Running Hours')])),
        Math.floor(Number(telemetryObj[this.getPropertyKey('Running Minutes')])));
    }
    if (this.telemetryObj) {
      const interval = Math.round((moment(telemetryObj.message_date).diff(moment(this.telemetryObj.message_date), 'milliseconds')) / 1000);
      const diff1 = Math.abs(interval - this.normalModelInterval);
      const diff2 = Math.abs(interval - this.turboModeInterval);
      this.telemetryInterval = interval;
    }
    const obj = JSON.parse(JSON.stringify(this.telemetryObj));
    // console.log(this.widgetPropertyList);
    this.widgetPropertyList.forEach(prop => {
      if (prop?.json_key && telemetryObj[prop.json_key] !== undefined && telemetryObj[prop.json_key] !== null) {
        obj[prop?.json_key] = {
          value: telemetryObj[prop?.json_key],
          date: telemetryObj.date
        };
      }
    });
    obj['previous_properties'] = this.previousProperties;
    // console.log(obj);
    this.telemetryObj = obj;
    this.previousProperties = [];
    Object.keys(this.telemetryObj).forEach(key => this.previousProperties.push(key));
    this.lastReportedTelemetryValues = obj;
    if (this.telemetryData.length >= 15) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.telemetryObj);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
  }

  getPropertyKey(name) {
    return this.propertyList.filter(prop => prop.name === name)[0]?.json_key || name;
  }

  getMidNightHours(filterObj) {
    return new Promise<void>((resolve1, reject) => {
      const obj = {...filterObj};
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (prop.json_key === this.getPropertyKey('Running Hours') || prop.json_key === this.getPropertyKey('Running Minutes')) {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
        }
      });

      obj.message_props = message_props;
      obj.partition_key = this.filterObj?.asset?.partition_key;
      this.apiSubscriptions.push(this.assetService.getFirstTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
            this.midNightHour = response.message[this.getPropertyKey('Running Hours')] ?
            Math.floor(Number(response.message[this.getPropertyKey('Running Hours')])) : 0;
            this.midNightMinute = response.message[this.getPropertyKey('Running Minutes')] ?
            Math.floor(Number(response.message[this.getPropertyKey('Running Minutes')])) : 0;
            resolve1();
        }, error => {
          // this.isTelemetryDataLoading = false;
          // alert('111111');
          resolve1();
        }));
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
    console.log(this.filterObj);
    if (this.filterObj?.assetArr.length > 0) {
      this.filterObj.asset = this.filterObj.assetArr[0];
    } else {
      this.filterObj.asset = undefined;
      this.filterObj.assetArr = undefined;
    }
  }

  onAssetDeselect() {
    this.filterObj.asset = undefined;
    this.filterObj.assetArr = undefined;
  }

  getThingsModelProperties(assetModel) {
    return new Promise<void>((resolve1) => {
      if (this.propertyList.length === 0) {
        const obj = {
          app: this.contextApp.app,
          name: assetModel
        };
        this.apiSubscriptions.push(this.assetModelService.getThingsModelProperties(obj).subscribe(
          (response: any) => {
            this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
            response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
            response.properties.derived_properties.forEach(prop => {
              prop.type = 'Derived Properties';
              console.log(prop);
              this.propertyList.push(prop);
            });
            resolve1();
          }, error => this.isTelemetryDataLoading = false
        ));
      } else {
        resolve1();
      }
    });
  }

  getAssetSignalRMode(assetId) {
    // this.signalRModeValue = true;
    this.apiSubscriptions.push(this.assetService.getAssetSignalRMode(this.contextApp.app, assetId).subscribe(
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
    clearInterval(this.c2dResponseInterval);
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    clearInterval(this.c2dResponseInterval);
    this.apiSubscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
