import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from './../../../environments/environment';
import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  EmbeddedViewRef,
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { ColumnChartComponent } from 'src/app/common/charts/column-chart/column-chart.component';
import { DataTableComponent } from 'src/app/common/charts/data-table/data-table.component';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { PieChartComponent } from 'src/app/common/charts/pie-chart/pie-chart.component';
import { DamagePlotChartComponent } from 'src/app/common/charts/damage-plot-chart/damage-plot-chart.component';
import { ChartService } from 'src/app/services/chart/chart.service';
import * as datefns from 'date-fns';
import { countInterface } from 'src/app/application/application-gateway-monitoring/count-interface';
import { ApplicationService } from 'src/app/services/application/application.service';

declare var $: any;
declare var createUnityInstance: any;
@Component({
  selector: 'app-app-data-dashboard',
  templateUrl: './app-data-dashboard.component.html',
  styleUrls: ['./app-data-dashboard.component.css'],
})
export class AppDataDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  ////Common Start ////
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  environmentApp = environment.app;
  blobURL = environment.blobURL;
  blobToken = environment.blobKey;
  defaultAppName = environment.app;
  decodedToken: any;

  mainTab = 'assets';
  subTab = 'map_view';
  childTab = 'status';

  filterObj: any = {};
  assets: any[] = [];
  configuredHierarchy: any ={};
  isTelemetryDataLoading = false;
  userData: any;
  constantData = CONSTANTS;
  ////Common End ////
  ////Assets Start ////
  ////Assets Map View Start ////
  mapAssets: any[] = [];
  healthyAssetCount = 0;
  unhealthyAssetCount = 0;
  mapFitBounds = true;
  centerLatitude: any;
  centerLongitude: any;
  assetModelsList: any;
  tileData: any;
  displayicon: boolean = true;
  tooltipmapicon: any;
  imagePath = './assets/img/m';
  customMapStyle = [
    {
      featureType: 'poi',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
  ];
  activeCircle = 'all';
  displayNameUnityModal: any;
  gameInstance: any;
  gameConfig: any;
  getAssetsAPILoading = false;
  assetModelAPILoading = false;
  ////Assets Map View end ////

  // Asset List View Start //

  //Status //
  countData: countInterface = {
    iot_assets: 0,
    online: 0,
    offline: 0,
    total_telemetry: 0,
    day_telemetry: 0
  }
  applications: any = [];
  currentOffset = 0;
  state:string = '';
  currentLimit = 10;
  hierarchy: any;
  loadMoreVisibility: boolean = true;
  loader = false;
  selectedApp: string;
  assetCount=0;
  assetTotalcount=0;
  userDataFromLocal: any;
  isProvisioned: string = 'true';
  receivedAppName: string;
  isSelectedAppData = false;
  appsList: any = [];
  tableConfig: any;
  isApplicationListLoading = false;

  // Performance //
  preOffset = 0;
  preLimit = 10;
  dailyReportApiLoading: boolean = false;
  loadMoreVisible = false;
  dailyReportsData = [];
  assetDailyReport: any = [];
  reportBtnData: any = {};
  // Asset List View end //

  propertyList: any[] = [];
  telemetryObj: any;
  apiTelemetryObj: any;
  telemetryData: any[] = [];
  refreshInterval: any;
  selectedTab = 'telemetry';
  lastReportedTelemetryValues: any;
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
  liveWidgets: any[] = [];
  historicalWidgets: any[] = [];
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
  loadingMessage: string;
  propList: any[];
  historicalDateFilter: any = {};
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  selectedDateRange: string;
  isShowOpenFilter = true;
  derivedKPIs: any[] = [];
  derivedKPIHistoricData: any[] = [];
  frequency: any;
  latestRunningHours: any = 0;
  latestRunningMinutes: any = 0;
  noOfRecords = CONSTANTS.NO_OF_RECORDS;
  widgetStringFromMenu: string;
  checkwidgettype: boolean = false;
  checkconditionaltype: boolean = false;
  checkingsmallwidget: '';
  checkconditionalwidget: '';
  isOpenControlPropertiesModal = false;
  controlpropertyassetId: any;
  controlPropertybtn = false;
  signalRControlTelemetry: any;
  lastTelemetryValueControl: any;
  refreshcontrolProperties = false;
  actualPropertyList: any;

  chartTbl = 1;
  alertCircleTbl = 1

  isGetAssetsAPILoading = false;
  originalAssets: any[] = [];



  constructor(
    private assetService: AssetService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private chartService: ChartService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private changeDetector: ChangeDetectorRef
    ) { }

    async ngOnInit(): Promise<void> {
      this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
      this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      this.onMainTabChange('assets');
      }

      onMainTabChange(mTabName){ //Main Tab
        this.mainTab = mTabName;
        this.onSubTabChange('map_view');
      }
      async onSubTabChange(sTabName){ //Inner tab
        this.subTab = sTabName;

        if( this.mainTab == 'assets' && sTabName === 'map_view')
        {
          this.filterObj= {};
          this.assets= [];
          this.configuredHierarchy={};
          this.mapAssets = [];
          await this.mapViewDataContainer();
        }
        else{
          this.onChildTabChange('status');
        }
      }

      onChildTabChange(value){ //Inner Sub Tab
        this.childTab = value;
        if(this.mainTab == 'assets' && this.subTab === 'list_view'){
          this.filterObj= {};
          this.assets= [];
          this.configuredHierarchy={};
          if(this.childTab === 'status' ){
            this.gatewayMonitoringContainer();
          }
          else{
            if(this.childTab === 'performance'){

              setTimeout(()=>{
                this.loadFromCache();
              },200);
              this.preOffset = 0;
              this.preLimit = 10;
              this.currentLimit = 10;
              this.performanceTab();
            }
          }
        }
      }

      // Hierarchy Start//
      onSaveHierachy(configuredHierarchy: any) {
        this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
        if(this.subTab === 'list_view' && this.childTab === 'status'){
          this.originalFilter = {};
        }
      }
      onClearHierarchy(configuredHierarchy: any) {
        this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
        if(this.subTab === 'list_view' && this.childTab === 'status'){
          this.hierarchy = { App: this.selectedApp };
        }
      }

      async onAssetFilterApply(filterType? , updateFilterObj = true, filterObj?, historicalWidgetUpgrade = false, isFromMainSearch = true) {
        if( filterType === 'assets_map' ){
          this.activeCircle = 'all';
          this.assets = this.hierarchyDropdown.getAssets();
          this.mapAssets =JSON.parse(JSON.stringify(this.assets));
          this.healthyAssetCount = 0;
          this.unhealthyAssetCount = 0;
          this.assets.forEach((assetObj) => {
            if (assetObj?.map_content?.healthy === true) {
              this.healthyAssetCount++;
            } else if (assetObj?.map_content?.healthy === false) {
              this.unhealthyAssetCount++;
            }
          });

          if (updateFilterObj) {
            const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
            pagefilterObj['hierarchy'] = { App: this.contextApp.app };
            Object.keys(this.configuredHierarchy).forEach((key) => {
              if (this.configuredHierarchy[key]) {
                pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
              }
            });
            delete pagefilterObj.assets;
            this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
          }

          if (this.mapAssets.length > 0) {
            this.mapFitBounds = false;
            const center = this.commonService.averageGeolocation(this.mapAssets);
            this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
            this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;

            // this.zoom = 8;
          } else {
            // this.mapFitBounds = true;
            this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
            this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
            this.mapFitBounds = false;
            // this.zoom = undefined;
          }
        }
        else{
          if( filterType === 'gatewayMoniter'){
            this.applications = [];
            this.currentOffset = 0;
            this.loadMoreVisibility = true;
            const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
            Object.keys(configuredHierarchy).length === 0;
            this.onClearHierarchy(configuredHierarchy);
            this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
            if (this.contextApp) {
              Object.keys(configuredHierarchy).forEach((key) => {
                if (configuredHierarchy[key]) {
                  this.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
                }
              });
            }
            this.assetMonitor();
            this.assetStatic();

            if (updateFilterObj) {
              const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
              pagefilterObj['hierarchy'] = { App: this.contextApp.app };
              Object.keys(this.configuredHierarchy).forEach((key) => {
                if (this.configuredHierarchy[key]) {
                  pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
                }
              });
              delete pagefilterObj.assets;
              this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
            }
          }
          else{
            if( filterType == 'performance' ){
              if (updateFilterObj) {
                const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
                pagefilterObj['hierarchy'] = { App: this.contextApp.app };
                Object.keys(this.configuredHierarchy).forEach((key) => {
                  if (this.configuredHierarchy[key]) {
                    pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
                  }
                });
                delete pagefilterObj.assets;
                this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
                await this.performanceTab();
              }
            }else
            {
              this.refreshcontrolProperties = true
              this.propertyList = [];
              this.c2dResponseMessage = [];
              this.signalRControlTelemetry = [];
              $('#overlay').hide();
              clearInterval(this.c2dResponseInterval);
              this.signalRService.disconnectFromSignalR('telemetry');
              this.signalRTelemetrySubscription?.unsubscribe();
              clearInterval(this.sampleCountInterval);
              this.controlpropertyassetId = JSON.parse(JSON.stringify(filterObj));

              const obj = JSON.parse(JSON.stringify(filterObj));
              let asset_model: any;
              if (obj.asset) {
                obj.asset_id = obj.asset.asset_id;
                asset_model = obj.asset.asset_model;
                delete obj.asset;
              } else {
                this.toasterService.showError('Asset selection is required', 'View Live Telemetry11');
                this.telemetryObj = undefined;
                this.apiTelemetryObj = undefined;
                this.telemetryData = [];
                this.liveWidgets = [];
                this.historicalWidgets = [];
                this.isFilterSelected = false;
                return;
            }
            // if (
            //   !this.contextApp?.dashboard_config &&
            //   !this.contextApp?.dashboard_config?.show_live_widgets &&
            //   !this.contextApp?.dashboard_config?.show_historical_widgets
            // ) {
            //   this.contextApp.dashboard_config = {
            //     show_live_widgets: true,
            //   };
            // }
            const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
            pagefilterObj['hierarchy'] = filterObj.asset.hierarchy;
            pagefilterObj['assets'] = filterObj.asset;
            //this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);

            this.originalFilter = JSON.parse(JSON.stringify(filterObj));
            this.isTelemetryDataLoading = true;
            await this.getAssetData();
            if (asset_model) {

              this.getTelemetryMode(this.filterObj.asset.asset_id);
              await this.getAssetderivedKPIs(this.filterObj.asset.asset_id);
              await this.getAssetsModelProperties(asset_model);
              if (this.propertyList) {
                let flag = false;
                this.propertyList.forEach(element => {
                  if (element?.metadata?.rw == 'w' || element?.metadata?.rw == 'rw') {
                    flag = true;
                    return;
                  }
                });
                this.controlPropertybtn = flag;
              }
              this.sampleCountArr = Array(60).fill(0);
              this.sampleCountValue = 0;
              await this.getLiveWidgets(asset_model);
              this.getLiveWidgetTelemetryDetails(obj);
            }
          }
          }
        }
      }

      getAssetData() {
        return new Promise<void>((resolve1) => {
          this.assetDetailData = undefined;
          this.apiSubscriptions.push(
            this.assetService.getAssetDetailById(this.contextApp.app, this.filterObj.asset.asset_id).subscribe(
              async (response: any) => {
                this.assetDetailData = JSON.parse(JSON.stringify(response));
                this.normalModelInterval = this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                  ? this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                  : 60;
                this.turboModeInterval = this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                  ? this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                  : 1;
                this.frequencyDiffInterval = Math.abs(
                  (this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                    ? this.assetDetailData?.metadata?.telemetry_mode_settings?.normal_mode_frequency
                    : 60) -
                  (this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                    ? this.assetDetailData?.metadata?.telemetry_mode_settings?.turbo_mode_frequency
                    : 1)
                );
                resolve1();
              },
              (error) => (this.isTelemetryDataLoading = false)
            )
          );
        });
      }
      // Hierarchy end//

      // Common Start //
      loadFromCache(item?) {
        if(item && this.mainTab == 'assets' && this.subTab == 'map_view'){
            this.hierarchyDropdown?.updateHierarchyDetail(item);
            if (item.hierarchy) {
              this.assets = this.hierarchyDropdown?.getAssets();
              this.onAssetFilterApply('assets_map',false);
            }
        }
        else{
          const item1 = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
          if(this.mainTab == 'assets' && this.subTab == 'list_view' &&  (this.childTab === 'status' || this.childTab === 'performance') ){
            if (item1) {
              this.hierarchyDropdown.updateHierarchyDetail(JSON.parse(JSON.stringify(item1)));
              if (item1?.hierarchy)
                this.hierarchy = item1?.hierarchy;
            }
          }
          // else{
          //   if (item1) {
          //     if (item1.assets) {
          //       this.filterObj.asset = item1.assets;
          //       this.onChangeOfAsset();
          //       this.onAssetFilterApply(this.filterObj, false, true, true);
          //     }
          //   }
          // }
        }
      }

      async getAssetModelData() {
        return new Promise<void>((resolve) => {
          const obj = {
            app: this.contextApp.app,
          };
          this.apiSubscriptions.push(
            this.assetModelService.getAssetsModelsList(obj).subscribe(
              (response: any) => {
                this.assetModelsList = response.data;
                resolve();
              },
              (error) => {
                this.toasterService.showError(error.message, 'Model List');
              }
            )
          );
        })
      }

      async getAssets(hierarchy) {
        return new Promise<void>((resolve1) => {
          const obj = {
            hierarchy: JSON.stringify(hierarchy),
            type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
          };
          this.apiSubscriptions.push(
            this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
              if (response?.data) {
                //this.assets = response.data;
                this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_LIST, this.assets);
              }
              resolve1();
            })
          );
        });
      }

      getAllAssets() {
        return new Promise<void>((resolve) => {
          this.isGetAssetsAPILoading = true;
          const obj = {
            hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
            type: CONSTANTS.NON_IP_ASSET + ',' + CONSTANTS.IP_ASSET,
            map_content: true,
          };
          this.apiSubscriptions.push(
            this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
              (response: any) => {
                if (response?.data) {
                  this.assets = response.data;
                  this.mapAssets = JSON.parse(JSON.stringify(this.assets));
                  this.isGetAssetsAPILoading = false;
                  this.assets.forEach((asset) => {
                    if (this.environmentApp === 'Kirloskar') {
                      asset.mttr = '7 Mins';
                      asset.mtbf = '2 days 5 hours';
                      asset.gas = '0.4%';
                      asset.power = '45 SCMH';
                    }
                    if (asset?.map_content?.healthy === true) {
                      this.healthyAssetCount++;
                    } else if (asset?.map_content?.healthy === false) {
                      this.unhealthyAssetCount++;
                    }
                    if (
                      asset.type === this.constantData.IP_ASSET &&
                      asset?.connection_state?.toLowerCase() === 'connected'
                    ) {
                      asset.icon = {
                        url: this.contextApp?.dashboard_config?.map_icons?.iot_asset?.healthy?.url
                          ? this.blobURL +
                          this.contextApp?.dashboard_config?.map_icons?.iot_asset?.healthy?.url +
                          this.blobToken
                          : './assets/img/iot-assets-green.svg',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                      };
                    } else if (
                      asset.type === this.constantData.IP_ASSET &&
                      asset?.connection_state?.toLowerCase() === 'disconnected'
                    ) {
                      asset.icon = {
                        url: './assets/img/assets-red.gif',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                      };
                    } else if (
                      asset.type === this.constantData.IP_GATEWAY &&
                      asset?.connection_state?.toLowerCase() === 'connected'
                    ) {
                      asset.icon = {
                        url: './assets/img/iot-gateways-green.svg',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                      };
                    } else if (
                      asset.type === this.constantData.IP_GATEWAY &&
                      asset?.connection_state?.toLowerCase() === 'disconnected'
                    ) {
                      asset.icon = {
                        url: './assets/img/assets-red.gif',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                      };
                    } else if (asset.type === this.constantData.NON_IP_ASSET) {
                      let pinData = this.modifyIcon(asset, this.assetModelsList);
                      asset.icon = {
                        url: this.contextApp?.dashboard_config?.map_icons?.legacy_asset?.healthy?.url
                          ? this.blobURL +
                          this.contextApp?.dashboard_config?.map_icons?.legacy_asset?.healthy?.url +
                          this.blobToken
                          : this.assetModelsList && pinData !== undefined && pinData && pinData.url ? this.blobURL + pinData.url + this.blobToken : './assets/img/legacy-assets.svg',
                        scaledSize: {
                          width: this.assetModelsList && pinData !== undefined && pinData && pinData.width ? pinData.width : 20,
                          height: this.assetModelsList && pinData !== undefined && pinData && pinData.height ? pinData.height : 20,
                        },
                      };
                    }
                  });
                  this.originalAssets = JSON.parse(JSON.stringify(this.assets));
                  const center = this.commonService.averageGeolocation(this.assets);
                  this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude;
                  this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude;
                  this.mapFitBounds = false;
                  if (!center.latitude && !this.contextApp.metadata?.latitude) {
                    navigator.geolocation.getCurrentPosition(this.showPosition)
                  }
                  if (!this.centerLatitude || !this.centerLongitude) {
                    this.centerLatitude = 23.0225;
                    this.centerLongitude = 72.5714;
                  }
                } else {
                  this.centerLatitude = this.contextApp.metadata?.latitude;
                  this.centerLongitude = this.contextApp.metadata?.longitude;
                  this.mapFitBounds = false;
                }
                resolve();
              },
              (error) => (this.isGetAssetsAPILoading = false)
            )
          );
        });
      }

      onChangeOfAsset() {
        const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);
        const frequencyArr = [];
        frequencyArr.push(asset?.metadata && asset?.metadata?.measurement_settings?.g1_measurement_frequency_in_ms ? asset.metadata?.measurement_settings?.g1_measurement_frequency_in_ms : 60);
        frequencyArr.push(asset?.metadata && asset?.metadata?.measurement_settings?.g2_measurement_frequency_in_ms ? asset.metadata?.measurement_settings?.g2_measurement_frequency_in_ms : 120);
        frequencyArr.push(asset?.metadata && asset?.metadata?.measurement_settings?.g3_measurement_frequency_in_ms ? asset.metadata?.measurement_settings?.g3_measurement_frequency_in_ms : 180);
        this.frequency = this.commonService.getLowestValueFromList(frequencyArr);
        if (this.historicalDateFilter.from_date && this.historicalDateFilter.to_date) {
          // this.onChangeOfAsset(this.filterObj.asset);
          const records = this.commonService.calculateEstimatedRecords(
            this.frequency,
            this.historicalDateFilter.from_date,
            this.historicalDateFilter.to_date
          );
          if (records > this.noOfRecords) {
            this.historicalDateFilter.isTypeEditable = true;
          } else {
            this.historicalDateFilter.isTypeEditable = false;
          }
        }
      }
      // Common End //

      // Map Start //
      async mapViewDataContainer() {
        this.assetModelsList = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODELS_LIST);
        if (this.assetModelsList == undefined) {
          await this.getAssetModelData();
        }
        this.contextApp.menu_settings.main_menu.forEach((item) => {
          if (item.page === 'Live Data' && item.visible === true) {
            this.displayicon = true;
            this.tooltipmapicon = item.display_name;
          } else if (item.page === 'Live Data' && item.visible === false) {
            this.displayicon = false;
          }
        });

        try {
          const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
          await this.getAllAssets();
          await this.getAssets(this.contextApp.user.hierarchy);

          if (this.assets?.length > 0) {
            const center = this.commonService.averageGeolocation(this.assets);
            this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude;
            this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude;
            if (!center.latitude && !this.contextApp.metadata?.latitude) {
              navigator.geolocation.getCurrentPosition(this.showPosition);
            }
            if (item) {
              this.loadFromCache(item);
            } else {
              await this.hierarchyDropdown.updateHierarchyDetail(this.contextApp.user);
              await this.onAssetFilterApply('assets_map'); // Call onAssetFilterApply after getAllAssets is completed
            }
            if (!this.centerLatitude || !this.centerLongitude) {
              this.centerLatitude = 23.0225;
              this.centerLongitude = 72.5714;
            }
            this.mapFitBounds = false;
          } else {
            this.centerLatitude = this.contextApp.metadata?.latitude;
            this.centerLongitude = this.contextApp.metadata?.longitude;
            this.mapFitBounds = false;
          }

          const center = this.commonService.averageGeolocation(this.assets);
          if (!center.latitude && !center.longitude) {
            this.centerLatitude = this.contextApp.metadata?.latitude;
            this.centerLongitude = this.contextApp.metadata?.longitude;
            this.mapFitBounds = false;
          }
        } catch (error) {
          this.toasterService.showError(error?.message, "Error");
        }
      }
      modifyIcon(asset: any, assetModelsList?: any[]) {
        if (asset && assetModelsList) {
          const assetModel = asset.asset_model;
          let pinIconUrl = assetModelsList.find(modelData => modelData.name === assetModel).mapPinIcon;
          return pinIconUrl;
        }
      }
      showPosition = (position) => {
        this.centerLatitude = position?.coords?.latitude || this.centerLatitude;
        this.centerLongitude = position.coords.longitude || this.centerLongitude;
      }
      onMarkerClick(infowindow, gm) {
        if (gm?.lastOpen != null) {
          gm.lastOpen?.close();
        }
        gm.lastOpen = infowindow;
        infowindow.open();
        this.cdr.detectChanges();
      }
      redirectToAsset(asset) {
        this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel']);
      }
      redirectToAssetControlPanel(asset, type) {
        this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel'], { fragment: type});
      }
      redirectToLiveData(asset,pageType?) {
        const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        pagefilterObj['hierarchy'] = asset.hierarchy;
        pagefilterObj['assets'] = asset;
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
        this.router.navigate(['applications', this.contextApp.app, pageType? pageType : 'dashboard']);
      }
      onClickOfCount(type) {
        const arr = [];
        this.activeCircle = type;
        if (type !== 'all') {
          this.assets.forEach((asset) => {
            if (type === 'healthy' && asset?.map_content?.healthy === true) {
              arr.push(asset);
            }
            if (type === 'unhealthy' && asset?.map_content?.healthy === false) {
              arr.push(asset);
            }
          });

          this.mapAssets = JSON.parse(JSON.stringify(arr));
        } else {
          this.mapAssets = JSON.parse(JSON.stringify(this.assets));
        }
        if (this.mapAssets.length > 0) {
          this.mapFitBounds = true;
          const center = this.commonService.averageGeolocation(this.mapAssets);
          this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
          this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;
          // this.zoom = 5;
        } else {
          this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
          this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
          this.mapFitBounds = false;
          // this.zoom = undefined;
        }
      }
      onSave(asset) {
        this.displayNameUnityModal = asset;
        $(".unity-modal-card").removeClass("d-none");
        $(".unity-modal-card").addClass("d-block");
        $(".unity-backdrop").removeClass("d-none");
        $(".unity-backdrop").addClass("d-block");

        $(".unity-backdrop").click(() => {
          $(".pswp__button--close").css("background-color", "#ff0000");
          $(".close-unity-card").css("fill", "#ffffff");
          setTimeout(() => {
            $(".pswp__button--close").css("background-color", "#000000");
            $(".close-unity-card").css("fill", "#ffffff");
          }, 1000);
        });
        var buildUrl = "assets/Build";
        this.gameConfig = {
          dataUrl: buildUrl + "/KemsysBuild.data",
          frameworkUrl: buildUrl + "/KemsysBuild.framework.js",
          codeUrl: buildUrl + "/KemsysBuild.wasm",
          companyName: "DefaultCompany",
          productName: "API Data",
          productVersion: "0.1",
        };
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
          // Mobile device style: fill the whole browser client area with the game canvas:
          var meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
          document.getElementsByTagName('head')[0].appendChild(meta);
        }
        createUnityInstance(document.querySelector("#unity-canvas"), this.gameConfig).then((unityInstance) => {
          this.gameInstance = unityInstance;
        });
      }
      onClose() {
        $(".unity-modal-card").addClass("d-none");
        $(".unity-modal-card").removeClass("d-block");
        $(".unity-backdrop").addClass("d-none");
        $(".unity-backdrop").removeClass("d-block");
        this.gameInstance.Quit();
        this.gameInstance = null;
      }
      async changeImagePath(icon:string){
        this.imagePath ='./assets/img/'+icon;
        await this.getAllAssets()
      }
      // Map End //
      getTileName() {
        let selectedItem;
        this.contextApp.menu_settings.main_menu.forEach((item) => {
          if (item.page === 'Live Data') {
            selectedItem = item.showAccordion;
          }
        });
        this.tileData = selectedItem;
      }
      onChartTblChange(value){
        this.chartTbl = value;
      }
      onAlertCircleTblChange(value){
        this.alertCircleTbl = value;
      }
      // List View Start //
      // Status Start //
      gatewayMonitoringContainer(){
        setTimeout(()=>{
          this.loadFromCache();
        },200);
        this.userDataFromLocal = this.userData;
        const obj = {
          environment: environment.environment,
          provisioned: this.isProvisioned
        };
        this.route.queryParams.subscribe((res) => {
          this.receivedAppName = res.appName;
        })

        if (this.userDataFromLocal.is_super_admin) {
          this.applicationService.getApplications(obj).subscribe((response: any) => {
            if (response?.data && response?.data?.length > 0) {
              let respData = response.data.map((item) => {
                return item.app;
              })
              this.appsList = respData;
              this.selectedApp = this.receivedAppName ? this.receivedAppName : respData[0];
              this.hierarchy = { App: this.selectedApp };
              this.getHierarchy();
              this.appName();
            }
            else { this.appsList = []; }
          },
            (error) => this.loader = false)
        }
        else if (this.contextApp && !this.userDataFromLocal.is_super_admin) {
          let appDataFromLocal = this.contextApp;
          this.selectedApp = appDataFromLocal.app
          this.appsList.push(this.selectedApp)
          this.appName();
        }
        setInterval(() => {
          this.appName();
        }, 1800000);

        this.tableConfig = {
          type: 'Applications',
          is_table_data_loading: this.isApplicationListLoading,
          table_class: 'table_class_new',
          no_data_message: '',
          data: [
            {
              header_name: 'Gateway Id',
              is_display_filter: true,
              value_type: 'string',
              // is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'asset_id',
              //is_sort: true
            },
            {
              header_name: 'Name',
              is_display_filter: true,
              value_type: 'string',
              // is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'name',
              //is_sort: true
            },
            {
              header_name: 'Status',
              value_type: 'string',
              // is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'connection_state',
              value_class: '',
              data_tooltip: 'offline_since',
              data_cellclass: 'cssclass',
              //is_sort: true
            },
            {
              header_name: 'Ingestion Status',
              value_type: 'string',
              // is_sort_required: true,
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'ingestion_status',
              // data_tooltip: 'last_ingestion_on',
              data_cellclass: 'ingestionCss'
            },
            {
              header_name: 'Last Ingestion On',
              value_type: 'string',
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'last_ingestion_on',
            },
            {
              header_name: 'CreatedOn',
              value_type: 'string',
              fixed_value_list: [],
              data_type: 'text',
              data_key: 'created_date',
              sort_by_key: 'created_date_time'
            },
            {
              header_name: 'Live Data',
              key: undefined,
              data_type: 'button',
              btn_list: [
                {
                  icon: 'fa fa-fw fa-eye',
                  text: '',
                  id: 'dashboard',
                  valueclass: 'd-flex justify-content-center w-75',
                  tooltip: 'View Live Data',
                }
              ],
            },
            {
              header_name: 'Historical Trend',
              key: undefined,
              data_type: 'button',
              btn_list: [
                {
                  icon: 'fa fa-fw fa-eye',
                  text: '',
                  id: 'historical-trend',
                  valueclass: 'd-flex justify-content-center w-75',
                  tooltip: 'View Historical Trend',
                },
              ],
            },
            {
              header_name: 'DPR Data',
              key: undefined,
              data_type: 'button',
              btn_list: [
                {
                  icon: 'fa fa-fw fa-eye',
                  text: '',
                  id: 'daily_report',
                  valueclass: 'd-flex justify-content-center w-75',
                  tooltip: 'View DPR'
                },
              ],
            },
          ],
        };
      }
      onTableFunctionCall(obj) {
        if(obj && (obj?.for === "dashboard" || obj?.for === 'historical-trend')){
          this.redirectToLiveData(obj.data, obj.for);
        }
        else{
          this.redirectToAssetControlPanel(obj.data, obj.for);
        }
      }

      getHierarchy() {
        if (this.userDataFromLocal.is_super_admin) {
          this.isSelectedAppData = false;
          localStorage.removeItem(CONSTANTS.SELECTED_APP_DATA);
          this.applicationService.getApplicationDetail(this.selectedApp).subscribe((response: any) => {
            response.app = this.selectedApp;
            response.user = {};
            response.user.hierarchy = { App: this.selectedApp };
            this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, response);
            let appObj = {
              app: this.selectedApp
            }
            this.applicationService.getExportedHierarchy(appObj).subscribe((response: any) => {
              this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response?.data);
              this.isSelectedAppData = true;
              this.changeDetector.detectChanges();
            })
          });
        }
        else {
          this.isSelectedAppData = true;
          this.changeDetector.detectChanges();
        }
      }
      appName() {
        this.applications = []
        this.loadMoreVisibility = true;
        this.currentOffset = 0;
        this.currentLimit = 10;
        if (this.selectedApp) {
          this.getHierarchy();
          this.hierarchy = { App: this.selectedApp };
          this.loadFromCache();
          this.assetStatic();
          this.assetMonitor()
        }
        else {
          this.isSelectedAppData = false;
          this.countData = {
            iot_assets: 0,
            online: 0,
            offline: 0,
            total_telemetry: 0,
            day_telemetry: 0
          };
          this.applications = []
        }
      }
      assetStatic() {
        const custObj = {
          hierarchy: JSON.stringify(this.hierarchy)
        }
        this.loader = true;
        this.applicationService.getAssetStatistics(this.selectedApp,custObj).subscribe((response: any) => {
          this.countData = {
            iot_assets: response?.iot_assets ?? 0,
            online: response?.online ?? 0,
            offline: response?.offline ?? 0,
            total_telemetry: response?.total_telemetry ?? 0,
            day_telemetry: response?.day_telemetry ?? 0

          }
        }, (err) => { this.loader = false })
      }
      fetchGateways(state: string){
        this.applications = [];
        this.currentOffset = 0;
        this.loadMoreVisibility=true;
        this.state=state;
        this.assetMonitor(this.state);
      }
      assetMonitor(changeState?) {
        const custObj = {
          offset: this.currentOffset,
          count: this.currentLimit,
          hierarchy: JSON.stringify(this.hierarchy)
        }
        this.loader = true;
        this.applicationService.getAssetMonitoring(this.selectedApp, custObj,changeState).subscribe((response: any) => {
          this.assetCount=response.count;
          this.assetTotalcount=response.totalcount;
          response?.data?.forEach((item) => {
            item.created_date_time = item.created_date
            item.created_date = this.commonService.convertUTCDateToLocalDate(item.created_date);
            if (item.last_ingestion_on!==null){
              item.last_ingestion_on =this.commonService.convertUTCDateToLocalDate(item.last_ingestion_on, CONSTANTS.DEFAULT_DATETIME_STR_FORMAT);
            }else{
              item.last_ingestion_on ="-";
            }
              if (item.ingestion_status === "Stopped") {
              item.ingestionCss = "offline"
            }
            else {
              item.ingestionCss = "online"
            }
            if (item.connection_state == "Disconnected") {
              item.connection_state = "Offline"
              item.cssclass = "offline";
              if (item.offline_since) {
                item.offline_since = 'Offline Since: ' + this.commonService.convertUTCDateToLocalDate(item.offline_since, CONSTANTS.DEFAULT_DATETIME_STR_FORMAT);
              }
            }
            else {
              item.connection_state = "Online"
              item.cssclass = "online";
              if (item.connection_state == "Online") {
                item.offline_since = undefined
              }
            }
            return item;
          })
          if (response?.data?.length < this.currentLimit) {
            this.loadMoreVisibility = false
          }

          let mergedObject = [...this.applications, ...response.data];
          const unique = [...new Map(mergedObject.map(item => [item.asset_id, item])).values()];

          this.applications = unique;

          //Note: Searching on same function it will push the same data again and again of searched list
          // So i have added list, and returned only unique record,
          //Currently added for asset_id filter as unique.
          //this.applications = [...this.applications, ...response.data];

          this.loader = false;
        },
          (error) => this.loader = false)
      }
      // Status End //
      // performance Start //
      async performanceTab(){
        let filterObj: any = {};
        const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        await this.getAssets(item.hierarchy);
        item.dateOption = "Yesterday";
        if (item) {
          if (item?.dateOption) {
            const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
            let from_date_convertTODate:any = new Date(dateObj.from_date * 1000);
            let to_date_convertTODate =  new Date(dateObj.to_date * 1000);
            to_date_convertTODate.setDate(to_date_convertTODate.getDate() - 7);
            this.selectedDateRange = item.dateOption;
            filterObj.from_date = datefns.format(from_date_convertTODate, "yyyy-MM-dd").toString();
            filterObj.to_date = datefns.format(from_date_convertTODate, "yyyy-MM-dd").toString();
            this.getDailyReportSubscription(filterObj);
          }
        }
      }
      dateConvertor(dateInfo){
        return  datefns.format(new Date(dateInfo * 1000), "yyyy-MM-dd").toString();
      }

      getDailyReportSubscription(filterObj: any){
        this.dailyReportsData = [];
        // this.dailyReportApiLoading= false;

      let newHierarchy = {};
        this.contextApp?.hierarchy?.levels.forEach((level, index) => {
          newHierarchy[level] = index != 0 ? this.configuredHierarchy[index] : this.contextApp.app;
        });
        let obj = {
          offset: this.preOffset,
          count: this.preLimit,
          hierarchy: JSON.stringify(Object.keys(this.configuredHierarchy)?.length <= 0 ? this.contextApp?.user?.hierarchy : newHierarchy),
          fromDate: filterObj?.from_date,
          toDate: filterObj?.to_date
        }
        this.dailyReportApiLoading = true;
        this.loadingMessage = "Loading Data, Please Wait...";
        this.loadMoreVisible = true;
        this.assetService.getDailyReportSubscription(this.contextApp?.app, obj).subscribe((response: any) => {
          if (response?.data) {
            let resData = response?.data;
            this.dailyReportApiLoading = false;
            this.dailyReportsData = [
              ...this.dailyReportsData,
              ...resData
            ]
            this.loadMoreVisible = this.dailyReportsData?.length < response?.totalcount;
          }
        },
          (error: any) => {
            this.dailyReportApiLoading = false;
            this.loadMoreVisible = false;
            this.toasterService.showError(error?.message, "Error");
          })

      }

      isTabVisible(report: any){
        let assetType: string;
        let menuItems:any= [];
        this.assets.forEach((asset: any) =>{
          if(asset?.length != 0){
            if(report?.assetId?.toLowerCase() === asset?.asset_id?.toLowerCase()){
              assetType = asset.type;
              if(asset?.type?.toLowerCase() === CONSTANTS?.NON_IP_ASSET?.toLowerCase()){
                if (this.contextApp?.menu_settings?.legacy_asset_control_panel_menu?.length > 0) {
                  menuItems = this.contextApp.menu_settings.legacy_asset_control_panel_menu;
                }
                else{
                  menuItems= CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
                }
              }
              else{
                if(this.contextApp?.menu_settings?.asset_control_panel_menu?.length >0){
                  menuItems = this.contextApp.menu_settings.asset_control_panel_menu;
                }
                else{
                  menuItems = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
                }
              }
            }
          }
        } )
        let selectedMenu: any;
        let ViewObj ={
          type : assetType,
          visible : false
        }
        if(menuItems?.length > 0){
          menuItems.forEach((menu) => {
            if(menu?.url === '#daily_report'){
              selectedMenu= menu;
              }
            });
          }
          if(selectedMenu?.url === '#daily_report' && selectedMenu?.visible ){
            ViewObj.visible= true ;
            return ViewObj;
          }
          else{
            ViewObj.visible= false ;
            return ViewObj;
          }
      }
      async dailyReportViewMore(report: any) {
        this.reportBtnData = report;
        await this.loadViewMoreData(report);
      }
      async loadViewMoreData(report){
        const dateObj = this.commonService.getMomentStartEndDate('This Month');
        dateObj.to_date = this.dateConvertor(dateObj.to_date);
        dateObj.from_date = this.dateConvertor(dateObj.from_date);
        dateObj['assetId']= report.assetId;
        await this.getDailyReport(dateObj);
        $('#moreInfoModal').modal({ backdrop: 'static', keyboard: false, show: true });
      }

      loadMoreReports(){
        this.getDailyReport();
      }

      async getDailyReport(dataObj? : any) {
        this.dailyReportApiLoading = true;
        let newHierarchy = {};
        this.contextApp?.hierarchy?.levels.forEach((level, index) => {
          newHierarchy[level] = index != 0 ? this.configuredHierarchy[index] : this.contextApp.app;
        });

        let obj: any = {
          hierarchy: JSON.stringify(Object.keys(this.configuredHierarchy)?.length <= 0 ? this.contextApp?.user?.hierarchy : newHierarchy),
          fromDate: this.filterObj?.from_date? this.filterObj?.from_date :dataObj?.from_date,
          toDate: this.filterObj?.to_date? this.filterObj?.to_date : dataObj?.to_date
        }
        if(dataObj){
          obj['assetId'] = dataObj.assetId;
        }
        else{
          obj = {
            ...obj,
            offset: this.preOffset,
            count: this.preLimit
          }
        }

        this.dailyReportApiLoading = true;
        this.loadingMessage = "Loading Data, Please Wait...";
        this.loadMoreVisible = true;
        this.assetService.getDailyReportSubscription(this.contextApp?.app, obj).subscribe((response: any) => {
          if (response?.data) {
            let resData = response?.data;
            if(dataObj && dataObj?.assetId){
              this.assetDailyReport=[...resData];
              // this.assetDailyReport = [
              //   ...this.assetDailyReport,
              //   ...resData
              // ]
              // this.loadMoreVisible = this.assetDailyReport?.length < response?.totalcount;
            }else{
              this.dailyReportsData = [
                ...this.dailyReportsData,
                ...resData
              ]
              this.loadMoreVisible = this.dailyReportsData?.length < response?.totalcount;
            }
          }
          this.dailyReportApiLoading = false;
        },
          (error: any) => {
            this.dailyReportApiLoading = false;
            this.loadMoreVisible = false;
            this.toasterService.showError(error?.message, "Error");
          })
      }

      closeModal(){
        $('#moreInfoModal').modal('hide');
        this.assetDailyReport = [];
      }
      // performance End //
      // List View End //


      onAssetFilterBtnClick() {
        $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
          e.stopPropagation();
        });
        $('#dd-open').on('hide.bs.dropdown', (e: any) => {
          if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
            e.preventDefault();
          }
        });
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
            telemetry_mode: !this.signalRModeValue ? 'normal' : 'turbo',
            asset_id: this.filterObj.asset.asset_id,
          },
          app: this.contextApp.app,
          job_type: 'DirectMethod',
          request_type: 'Change Asset Mode',
          job_id: this.filterObj.asset.asset_id + '_' + this.commonService.generateUUID(),
          sub_job_id: null,
        };
        obj.sub_job_id = obj.job_id + '_1';
        this.apiSubscriptions.push(
          this.assetService
            .callAssetMethod(obj, this.contextApp.app, this.filterObj?.asset?.gateway_id || this.filterObj?.asset?.asset_id)
            .subscribe(
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
              },
              (error) => {
                this.toasterService.showError(error?.message, 'Change Telemetry Mode');
                this.signalRModeValue = !this.signalRModeValue;
                this.isC2dAPILoading = false;
                this.c2dLoadingMessage = undefined;
              }
            )
        );
      }

      compareFn(c1, c2): boolean {
        return c1 && c2 ? c1.asset_id === c2.asset_id : c1 === c2;
      }

  onTabChange() {
    this.signalRService.disconnectFromSignalR('telemetry');
    // this.signalRService.disconnectFromSignalR('alert');
    this.telemetryData = JSON.parse(JSON.stringify([]));
    this.telemetryObj = undefined;
    this.apiTelemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.filterObj.asset = undefined;
    this.widgetPropertyList = [];
    this.c2dResponseMessage = [];
    this.isC2dAPILoading = false;
    this.c2dLoadingMessage = undefined;
    clearInterval(this.c2dResponseInterval);
    this.loadFromCache();
    $('#overlay').hide();
  }

  onDeSelectAll(event) {
    this.historicalDateFilter.widgets = [];
  }

  getHistoricalWidgets(assetModel, historicalWidgetUpgrade) {
    return new Promise<void>((resolve1) => {
      const params = {
        app: this.contextApp.app,
        name: assetModel,
      };
      this.historicalWidgets = [];
      this.apiSubscriptions.push(
        this.assetModelService.getAssetsModelLayout(params).subscribe(
          async (response: any) => {
            if (response?.historical_widgets?.length > 0) {
              this.historicalWidgets = response.historical_widgets;
              this.historicalWidgets.forEach((item) => {
                item.edge_derived_props = false;
                item.cloud_derived_props = false;
                item.measured_props = false;
                item.derived_kpis = false;
                item.y1axis.forEach((prop) => {
                  // const type = this.propertyList.find((propObj) => propObj.json_key === prop.json_key)?.type;
                  this.SetItemDetails(prop, item);
                });
                item.y2axis.forEach((prop) => {
                  this.SetItemDetails(prop, item);
                });
              });
              // if (historicalWidgetUpgrade) {
              //   this.historicalDateFilter.widgets = JSON.parse(JSON.stringify(this.historicalWidgets));
              // }
            } else {
              this.historicalDateFilter.widgets = [];
            }
            this.isGetWidgetsAPILoading = false;
            this.isFilterSelected = true;
            this.isTelemetryDataLoading = false;
            resolve1();
          },
          () => {
            this.isGetWidgetsAPILoading = false;
            this.isTelemetryDataLoading = false;
            resolve1();
          }
        )
      );
    });
  }

  private SetItemDetails(prop: any, item: any) {
    if (prop.type === 'Derived KPIs') {
      item.derived_kpis = true;
    } else if (prop?.type === 'Edge Derived Properties') {
      item.edge_derived_props = true;
    } else if (prop?.type === 'Cloud Derived Properties') {
      item.cloud_derived_props = true;
    } else {
      item.measured_props = true;
    }
  }

  getLiveWidgets(assetType) {
    return new Promise<void>((resolve1) => {
      const params = {
        app: this.contextApp.app,
        name: assetType,
      };
      this.liveWidgets = [];
      this.actualPropertyList = [];

      this.isGetWidgetsAPILoading = true;
      this.apiSubscriptions.push(
        this.assetModelService.getAssetsModelLiveWidgets(params).subscribe(
          async (response: any) => {
            if (response?.live_widgets?.length > 0) {
              response.live_widgets?.forEach((widget) => {
                this.checkingsmallwidget = widget.widgetType;
                this.checkconditionalwidget = widget.widgetType;
                if (widget.widgetType === 'SmallNumber') {
                  this.checkwidgettype = true;
                }
                if (widget.widgetType === 'ConditionalNumber') {
                  this.checkconditionaltype = true;
                }
                widget.edge_derived_props = false;
                widget.cloud_derived_props = false;
                widget.derived_kpis = false;
                widget.measured_props = false;
                if (widget.widgetType === 'ConditionalNumber') {
                  let propertiesData = [];
                  widget['formula'] = widget?.properties[0]?.formula;
                  widget['text'] = widget?.properties[0]?.text;
                  widget?.properties[0]?.json_Data.forEach((prop) => {
                    if (prop) {
                      prop.json_key = prop.json_key;
                    }
                    prop.type = prop?.type;
                    this.actualPropertyList.push(prop);
                    propertiesData.push(prop);
                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                  });
                  widget.properties = propertiesData;
                }
                else if (widget.widgetType !== 'LineChart' && widget.widgetType !== 'AreaChart' && widget.widgetType !== 'ConditionalNumber') {
                  widget?.properties.forEach((prop) => {
                    if (prop.property) {
                      prop.json_key = prop.property.json_key;
                    }
                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                    this.actualPropertyList.push(prop);
                  });
                }
                else {
                  widget?.y1AxisProps?.forEach((prop) => {
                    if (prop.id) {
                      prop.json_key = prop.id;
                    }
                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.property?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                    this.actualPropertyList.push(prop);

                  });
                  widget?.y2AxisProps?.forEach((prop) => {
                    if (prop.id) {
                      prop.json_key = prop.id;
                    }

                    if (prop?.type === 'Derived KPIs') {
                      widget.derived_kpis = true;
                    } else if (prop?.type === 'Edge Derived Properties') {
                      widget.edge_derived_props = true;
                    } else if (prop?.property?.type === 'Cloud Derived Properties') {
                      widget.cloud_derived_props = true;
                    } else {
                      widget.measured_props = true;
                    }
                    this.actualPropertyList.push(prop);

                  });
                }
                if (widget.dashboardVisibility) {
                  this.liveWidgets.push(widget);
                }
              });
            }
            this.isGetWidgetsAPILoading = false;
            resolve1();
          },
          () => {
            this.isGetWidgetsAPILoading = false;
            this.isTelemetryDataLoading = false;
          }
        )
      );
    });
  }

  selectedDate(filterObj) {
    this.historicalDateFilter.from_date = filterObj.from_date;
    this.historicalDateFilter.to_date = filterObj.to_date;
    this.historicalDateFilter.dateOption = filterObj.dateOption;
    // this.historicalDateFilter.last_n_secs = filterObj.last_n_secs;
    if (this.filterObj.asset) {
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        this.historicalDateFilter.from_date,
        this.historicalDateFilter.to_date
      );
      if (records > this.noOfRecords) {
        this.historicalDateFilter.isTypeEditable = true;
      } else {
        this.historicalDateFilter.isTypeEditable = false;
      }
    }
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View History');
      if (type === 'aggregation') {
        this.historicalDateFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.historicalDateFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  addPropertyInList(prop) {
    if (this.widgetPropertyList.length === 0) {
      this.widgetPropertyList.push(prop);
    } else {
      const index = this.widgetPropertyList.findIndex((propObj) => propObj.json_key === prop.json_key);
      if (index === -1) {
        this.widgetPropertyList.push(prop);
      }
    }
  }

  getHistoricalWidgetsDrivedKPIDetails() {
    this.propList = [];
    let kpiCodes = '';
    this.historicalWidgets.forEach((widget) => {
      widget.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj?.code + ',';
        }
      });
      widget.y2axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type === 'Derived KPIs') {
          this.propList.push(prop.json_key);
          const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
          kpiCodes += kpiObj.code + ',';
        }
      });
    });
    kpiCodes = kpiCodes.replace(/,\s*$/, '');
    if (kpiCodes.length > 0) {
      return new Promise<void>((resolve1) => {
        this.isTelemetryDataLoading = true;
        this.isFilterSelected = true;
        const obj = {
          kpi_codes: kpiCodes,
          from_date: undefined,
          to_date: undefined,
          // last_n_secs: undefined,
        };
        if (this.historicalDateFilter.dateOption !== 'Custom Range') {
          const dateObj = this.commonService.getMomentStartEndDate(this.historicalDateFilter.dateOption);
          obj.from_date = dateObj.from_date;
          obj.to_date = dateObj.to_date;
          // obj.last_n_secs = this.historicalDateFilter.last_n_secs;
        } else {
          obj.from_date = this.historicalDateFilter.from_date;
          obj.to_date = this.historicalDateFilter.to_date;
        }

        this.assetService.getDerivedKPISHistoricalData(this.contextApp.app, obj).subscribe((response: any) => {
          response.data.forEach((item) => {
            const itemobj = {
              message_date: item.metadata.process_end_time,
            };
            itemobj[item.kpi_json_key] = item.kpi_result;
            this.derivedKPIHistoricData.push(itemobj);
            // this.derivedKPIHistoricData.reverse();
          });
          // this.derivedKPIHistoricData = response.data;
          resolve1();
        });
      });
    }
  }

  flattenTelemetryData = (telemetryObj: any) => {
    const normalizedTelemetryObj = {};
    const supportedTelemetryType = ['m', 'ed', 'cd', 'dkpi'];
    supportedTelemetryType.forEach(telemetryType => {
      if (telemetryObj.hasOwnProperty(telemetryType)) {
        Object.keys(telemetryObj[telemetryType]).forEach(key => {
          normalizedTelemetryObj[`${telemetryType}#${key}`] = telemetryObj[telemetryType][key];
        });
        delete telemetryObj[telemetryType];
      }
    });
    return { ...normalizedTelemetryObj, ...telemetryObj };
  }

  async getLiveWidgetTelemetryDetails(obj) {
    this.telemetryObj = undefined;
    this.apiTelemetryObj = undefined;
    this.telemetryInterval = undefined;
    this.lastReportedTelemetryValues = undefined;
    this.telemetryData = JSON.parse(JSON.stringify([]));
    obj.count = 1;
    const midnight = datefns.getUnixTime(datefns.startOfDay(new Date()));
    const now = datefns.getUnixTime(new Date());
    obj.from_date = midnight;
    obj.to_date = now;
    // obj.last_n_secs = obj.to_date - obj.from_date;
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
      (data) => {
        // if (data.type !== 'alert') {
        if (data) {
          let obj = JSON.parse(JSON.stringify(data));
          // delete obj.m;
          // delete obj.ed;
          // delete obj.cd;
          // delete obj.dkpi;
          obj = this.flattenTelemetryData(obj);
          data = JSON.parse(JSON.stringify(obj));
        }
        this.signalRControlTelemetry = JSON.parse(JSON.stringify(data));
        this.processTelemetryData(data);
        this.isTelemetryDataLoading = false;
      }
      // }
    );
    this.apiSubscriptions.push(
      this.assetService.getLastTelmetry(this.contextApp.app, obj).subscribe(
        (response: any) => {
          if (response?.message) {
            this.lastTelemetryValueControl = response?.message;
            this.refreshcontrolProperties = false;
            response.message.date = this.commonService.convertUTCDateToLocal(response.message_date);
            response.message.message_date = this.commonService.convertUTCDateToLocal(response.message_date);
            const obj = {};
            if (environment.app === 'SopanCMS') {
              this.latestRunningHours = response.message[this.getPropertyKey('Running Hours')];
              this.latestRunningMinutes = response.message[this.getPropertyKey('Running Minutes')];
            }
            this.actualPropertyList.forEach((prop) => {
              var type = (prop?.type === 'Edge Derived Properties' || prop?.type === 'ed') ? 'ed' :
                (prop?.type === 'Measured Properties' || prop?.type === 'm') ? 'm' :
                  (prop?.type === 'Cloud Derived Properties' || prop?.type === 'cd') ? 'cd' : '';
              if (prop.type !== 'Derived KPIs') {
                var typeKey = type ?? '';
                obj[prop?.composite_key] = {
                  value: response.message[typeKey]?.[prop?.json_key],
                  date: response.message.message_date,
                };
              } else {
                const kpiObj = this.derivedKPIs.find((kpi) => kpi.kpi_json_key === prop.json_key);
                obj[prop?.composite_key] = {
                  value: kpiObj.kpi_result,
                  date: this.commonService.convertUTCDateToLocal(kpiObj.process_end_time),

                };
              }
            });
            this.previousProperties = [];
            obj['previous_properties'] = [];
            this.telemetryObj = obj;
            this.apiTelemetryObj = JSON.parse(JSON.stringify(obj));
            if (environment.app === 'SopanCMS') {
              this.getTimeDifference(
                Math.floor(Number(this.latestRunningHours)),
                Math.floor(Number(this.latestRunningMinutes))
              );
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
        },
        (error) => (this.isTelemetryDataLoading = false)
      )
    );
  }

  getHistoricalWidgetTelemetryDetails() {
    $('#historic_charts').children().remove();
    if (this.historicalDateFilter?.widgets?.length === 0) {
      this.toasterService.showError(
        'Select at least one ' + this.widgetStringFromMenu + ' to view the data',
        'View Telemetry Data'
      );
      this.isTelemetryDataLoading = false;
      // this.isFilterSelected = false;
      return;
    }
    this.historicalDateFilter?.widgets.forEach((widget) => {
      widget.y1axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
      widget.y2axis.forEach((prop) => {
        if (this.propList.indexOf(prop.json_key) === -1 && prop.type !== 'Derived KPIs') {
          this.propList.push(prop.json_key);
        }
      });
    });

    this.telemetryData = [];
    const filterObj = JSON.parse(JSON.stringify(this.filterObj));
    filterObj.epoch = true;
    filterObj.app = this.contextApp.app;
    filterObj.asset_id = this.filterObj.asset.asset_id;
    // filterObj.message_props = '';
    filterObj.from_date = null;
    filterObj.to_date = null;
    // filterObj.last_n_secs = null;
    const propArr = [];
    this.propertyList.forEach((propObj) => {
      this.propList.forEach((prop) => {
        if (prop === propObj.json_key && propObj.type !== 'Derived KPIs') {
          propArr.push(propObj);
        }
      });
    });
    // this.propList.forEach((prop, index) =>
    // filterObj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
    let measured_message_props = '';
    let edge_derived_message_props = '';
    let cloud_derived_message_props = '';
    propArr.forEach((prop, index) => {
      if (prop.type === 'Edge Derived Properties') {
        edge_derived_message_props = edge_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      } else if (prop.type === 'Cloud Derived Properties') {
        cloud_derived_message_props = cloud_derived_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      } else {
        measured_message_props = measured_message_props + prop.json_key + (propArr[index + 1] ? ',' : '');
      }
    });
    measured_message_props = measured_message_props.replace(/,\s*$/, '');
    edge_derived_message_props = edge_derived_message_props.replace(/,\s*$/, '');
    cloud_derived_message_props = cloud_derived_message_props.replace(/,\s*$/, '');
    filterObj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
    filterObj['edge_derived_message_props'] = edge_derived_message_props ? edge_derived_message_props : undefined;
    filterObj['cloud_derived_message_props'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
    if (this.historicalDateFilter.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.historicalDateFilter.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
      // filterObj.last_n_secs = this.historicalDateFilter.last_n_secs;
    } else {
      filterObj.from_date = this.historicalDateFilter.from_date;
      filterObj.to_date = this.historicalDateFilter.to_date;
    }
    // filterObj.from_date = moment().subtract(30, 'minutes').utc().unix();
    // filterObj.to_date = now;
    let method;
    // if (filterObj.to_date - filterObj.from_date > 3600 && !this.historicalDateFilter.isTypeEditable) {
    //   this.historicalDateFilter.isTypeEditable = true;
    //   this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
    //   this.isTelemetryDataLoading = false;
    //   this.isFilterSelected = false;
    //   return;
    // }
    const record = this.commonService.calculateEstimatedRecords(this.frequency, filterObj.from_date, filterObj.to_date);
    if (record > this.noOfRecords && !this.historicalDateFilter.isTypeEditable) {
      this.historicalDateFilter.isTypeEditable = true;
      this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
      this.isTelemetryDataLoading = false;
      this.isFilterSelected = false;
      return;
    }
    const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    pagefilterObj['hierarchy'] = filterObj.asset.hierarchy;
    pagefilterObj['assets'] = filterObj.asset;
    pagefilterObj['from_date'] = filterObj.from_date;
    pagefilterObj['to_date'] = filterObj.to_date;
    pagefilterObj['dateOption'] = this.historicalDateFilter.dateOption;
    //this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    const asset = this.assets.find((assetObj) => assetObj.asset_id === filterObj.asset_id);
    filterObj.partition_key = asset.partition_key;
    delete filterObj.count;
    delete filterObj.asset;
    filterObj.order_dir = 'ASC';
    if (this.historicalDateFilter.isTypeEditable) {
      if (this.historicalDateFilter.type) {
        if (!this.historicalDateFilter.sampling_time || !this.historicalDateFilter.sampling_format) {
          this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
          this.isTelemetryDataLoading = false;
          this.isFilterSelected = false;
          return;
        } else {
          delete filterObj.aggregation_minutes;
          delete filterObj.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.historicalDateFilter.sampling_time * 60,
            filterObj.from_date,
            filterObj.to_date
          );
          if (records > this.noOfRecords) {
            this.loadingMessage =
              'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
          }
          filterObj.sampling_time = this.historicalDateFilter.sampling_time;
          filterObj.sampling_format = this.historicalDateFilter.sampling_format;
          method = this.assetService.getAssetSamplingTelemetry(filterObj, this.contextApp.app);
        }
      } else {
        if (!this.historicalDateFilter.aggregation_minutes || !this.historicalDateFilter.aggregation_format) {
          this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
          this.isTelemetryDataLoading = false;
          this.isFilterSelected = false;
          return;
        } else {
          delete filterObj.sampling_time;
          delete filterObj.sampling_format;
          filterObj.aggregation_minutes = this.historicalDateFilter.aggregation_minutes;
          filterObj.aggregation_format = this.historicalDateFilter.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(
            this.historicalDateFilter.aggregation_minutes * 60,
            filterObj.from_date,
            filterObj.to_date
          );
          this.loadingMessage =
            'Loading ' + records + ' data points.' + (records > 100 ? 'It may take some time.' : '') + 'Please wait...';
          method = this.assetService.getAssetTelemetry(filterObj);
        }
      }
    } else {
      delete filterObj.aggregation_minutes;
      delete filterObj.aggregation_format;
      delete filterObj.sampling_time;
      delete filterObj.sampling_format;
      const records = this.commonService.calculateEstimatedRecords(
        this.frequency,
        filterObj.from_date,
        filterObj.to_date
      );
      if (records > this.noOfRecords) {
        this.loadingMessage =
          'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
      }
      method = this.assetService.getAssetTelemetry(filterObj);
    }
    this.isTelemetryDataLoading = true;
    this.isFilterSelected = true;
    // this.y2AxisProps.forEach((prop, index) =>
    // filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    // if (filterObj.message_props.charAt(filterObj.message_props.length - 1) === ',') {
    //   filterObj.message_props = filterObj.message_props.substring(0, filterObj.message_props.length - 1);
    // }
    this.apiSubscriptions.push(
      method.subscribe((response: any) => {
        if (response && response.data) {
          this.telemetryData = response.data;
          this.telemetryData = this.telemetryData.concat(this.derivedKPIHistoricData);
          const nullValueArr = [];
          propArr.forEach((prop, index) => {
            let flag = false;
            for (let i = 0; i < this.telemetryData.length; i++) {
              if (response.data[i][prop.json_key] !== null && response.data[i][prop.json_key] !== undefined) {
                flag = false;
                break;
              } else {
                delete response.data[i][prop.json_key];
                flag = true;
              }
            }
            if (flag) {
              nullValueArr.push(prop.json_key);
            }
          });
          let telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
          telemetryData.forEach((item) => {
            item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
            // item.message_date = new Date(item.message_date);
            item.message_date_obj = new Date(item.message_date);
          });
          telemetryData = this.commonService.sortDataBaseOnTime(telemetryData, 'message_date');
          this.isTelemetryDataLoading = false; // this.loadLineChart(telemetryData);
          if (telemetryData.length > 0) {
            this.historicalDateFilter.widgets?.forEach((widget) => {
              let noDataFlag = true;
              widget.y1axis?.forEach((prop, index) => {
                if (nullValueArr.indexOf(prop.json_key) === -1) {
                  noDataFlag = false;
                }
              });
              if (noDataFlag) {
                widget.y2axis?.forEach((prop, index) => {
                  if (nullValueArr.indexOf(prop.json_key) === -1) {
                    noDataFlag = false;
                  }
                });
              }
              let componentRef;
              if (widget.chartType === 'LineChart' || widget.chartType === 'AreaChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
              } else if (widget.chartType === 'ColumnChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
              } else if (widget.chartType === 'BarChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
              } else if (widget.chartType === 'PieChart') {
                componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
              } else if (widget.chartType === 'Table') {
                componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
              } else if (widget.chartType === 'VibrationDamagePlot') {
                componentRef = this.factoryResolver
                  .resolveComponentFactory(DamagePlotChartComponent)
                  .create(this.injector);
              }
              if (widget.chartType === 'Table') {
                let reverseTelemetry = Object.assign([], telemetryData);
                componentRef.instance.telemetryData = noDataFlag ? [] : reverseTelemetry.reverse();
              }
              else
                componentRef.instance.telemetryData = noDataFlag ? [] : telemetryData;
              componentRef.instance.propertyList = this.propertyList;
              componentRef.instance.y1AxisProps = widget.y1axis;
              componentRef.instance.y2AxisProps = widget.y2axis;
              componentRef.instance.xAxisProps = widget.xAxis;
              componentRef.instance.chartType = widget.chartType;
              componentRef.instance.chartConfig = widget;
              componentRef.instance.chartStartdate = filterObj.from_date;
              componentRef.instance.chartEnddate = filterObj.to_date;
              componentRef.instance.chartHeight = '23rem';
              componentRef.instance.chartWidth = '100%';
              componentRef.instance.chartTitle = widget.title;
              componentRef.instance.chartId = widget.chart_Id;
              this.appRef.attachView(componentRef.hostView);
              const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
              document.getElementById('historic_charts').prepend(domElem);
            });
          }
        }
      })
    );
  }

  processTelemetryData(telemetryObj) {
    this.telemetryObj = telemetryObj
    telemetryObj.date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    telemetryObj.message_date = this.commonService.convertUTCDateToLocal(telemetryObj.timestamp || telemetryObj.ts);
    // this.sampleCountArr[0] = this.sampleCountArr[0] + 1;
    if (environment.app === 'SopanCMS') {
      if (environment.app === 'SopanCMS') {
        this.latestRunningHours = telemetryObj[this.getPropertyKey('Running Hours')];
        this.latestRunningMinutes = telemetryObj[this.getPropertyKey('Running Minutes')];
      }
      this.getTimeDifference(
        Math.floor(Number(this.latestRunningHours)),
        Math.floor(Number(this.latestRunningMinutes))
      );
    }
    if (this.telemetryObj) {
      const interval = datefns.differenceInMilliseconds(new Date(telemetryObj.message_date), new Date(this.telemetryObj.message_date)) / 1000;
      this.telemetryInterval = interval;
    }
    const obj = this.telemetryObj ? JSON.parse(JSON.stringify(this.telemetryObj)) : {};
    this.actualPropertyList.forEach((prop) => {
      if (prop?.json_key && telemetryObj[prop.composite_key] !== undefined && telemetryObj[prop.composite_key] !== null) {
        obj[prop?.composite_key] = {
          value: telemetryObj[prop?.composite_key],
          date: telemetryObj.date,
        };
      }
    });

    // obj['previous_properties'] = this.previousProperties;
    // obj['message_date'] = telemetryObj.message_date;
    // obj["asset_id"] = telemetryObj.asset_id;

    // this.telemetryObj = Object.assign({}, obj);

    obj['previous_properties'] = this.previousProperties;
    obj['message_date'] = telemetryObj.message_date;
    this.telemetryObj = obj;
    this.previousProperties = [];
    Object.keys(this.telemetryObj).forEach((key) => this.previousProperties.push(key));
    this.lastReportedTelemetryValues = obj;
    if (this.telemetryData.length >= 15) {
      this.telemetryData.splice(0, 1);
    }
    this.telemetryData.push(this.telemetryObj);
    this.telemetryData = JSON.parse(JSON.stringify(this.telemetryData));
  }

  getPropertyKey(name) {
    return this.propertyList.filter((prop) => prop.name === name)[0]?.json_key || name;
  }

  getMidNightHours(filterObj) {
    return new Promise<void>((resolve1, reject) => {
      const obj = { ...filterObj };
      obj.order_dir = 'ASC';
      let message_props = '';
      this.propertyList.forEach((prop, index) => {
        if (
          prop.json_key === this.getPropertyKey('Running Hours') ||
          prop.json_key === this.getPropertyKey('Running Minutes')
        ) {
          message_props = message_props + prop.json_key + (this.propertyList[index + 1] ? ',' : '');
        }
      });

      obj.message_props = message_props;
      obj.partition_key = this.filterObj?.asset?.partition_key;
      this.apiSubscriptions.push(
        this.assetService.getFirstTelmetry(this.contextApp.app, obj).subscribe(
          (response: any) => {
            this.midNightHour = response.message[this.getPropertyKey('Running Hours')]
              ? Math.floor(Number(response.message[this.getPropertyKey('Running Hours')]))
              : 0;
            this.midNightMinute = response.message[this.getPropertyKey('Running Minutes')]
              ? Math.floor(Number(response.message[this.getPropertyKey('Running Minutes')]))
              : 0;
            resolve1();
          },
          (error) => {
            // this.isTelemetryDataLoading = false;
            // alert('111111');
            resolve1();
          }
        )
      );
    });
  }

  getTimeDifference(hour, minute) {
    if (
      this.midNightHour !== undefined &&
      this.midNightHour !== null &&
      this.midNightMinute !== undefined &&
      this.midNightMinute !== null &&
      hour !== undefined &&
      hour !== null &&
      minute !== undefined &&
      minute !== null
    ) {
      const midNightTime = this.midNightHour * 60 + this.midNightMinute;
      const currentTime = Number(hour) * 60 + Number(minute);
      const diff = currentTime - midNightTime;
      this.currentHour = Math.floor(diff / 60);
      this.currentMinute = diff - this.currentHour * 60;
    }
  }

  onAssetSelection() {
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

  getAssetderivedKPIs(assetId) {
    return new Promise<void>((resolve) => {
      this.apiSubscriptions.push(
        this.assetService.getDerivedKPIs(this.contextApp.app, assetId).subscribe((response: any) => {
          if (response && response.data) {
            this.derivedKPIs = response.data;
          } else if (response?.derived_kpis) {
            this.derivedKPIs = response.derived_kpis;
          }
          this.derivedKPIs.forEach((kpi) => kpi.type === 'Derived KPI');
          resolve();
        })
      );
    });
  }

  getAssetsModelProperties(assetModel) {
    return new Promise<void>((resolve1) => {
      if (this.propertyList.length === 0) {
        const obj = {
          app: this.contextApp.app,
          name: assetModel,
        };
        this.apiSubscriptions.push(
          this.assetModelService.getAssetsModelProperties(obj).subscribe(
            (response: any) => {
              this.propertyList = response.properties.measured_properties
                ? response.properties.measured_properties
                : [];
              response.properties.edge_derived_properties = response.properties.edge_derived_properties
                ? response.properties.edge_derived_properties
                : [];
              response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
                ? response.properties.cloud_derived_properties
                : [];
              response.properties.edge_derived_properties.forEach((prop) => {
                prop.type = 'Edge Derived Properties';
                this.propertyList.push(prop);
              });
              response.properties.cloud_derived_properties.forEach((prop) => {
                prop.type = 'Cloud Derived Properties';
                this.propertyList.push(prop);
              });
              this.derivedKPIs.forEach((kpi) => {
                const obj: any = {};
                obj.type = 'Derived KPIs';
                obj.name = kpi.name;
                obj.json_key = kpi.kpi_json_key;
                obj.json_model = {};
                obj.json_model[obj.json_key] = {};
                this.propertyList.push(obj);
              });
              resolve1();
            },
            (error) => (this.isTelemetryDataLoading = false)
          )
        );
      } else {
        resolve1();
      }
    });
  }

  getTelemetryMode(assetId) {
    // this.signalRModeValue = true;
    this.apiSubscriptions.push(
      this.assetService.getTelemetryMode(this.contextApp.app, assetId).subscribe(
        (response: any) => {
          const newMode =
            response?.mode?.toLowerCase() === 'normal'
              ? false
              : response?.mode?.toLowerCase() === 'turbo'
                ? true
                : false;
          if (this.signalRModeValue === newMode) {
            // $('#overlay').hide();
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
        },
        (error) => (this.isTelemetryDataLoading = false)
      )
    );
  }
  // openControlPropertiesModal() {
  //   this.isOpenControlPropertiesModal = true;
  // }

  ngAfterViewInit() {
    if ($('#overlay')) {
      $('#overlay').hide();
    }
  }

  ngOnDestroy() {
    clearInterval(this.refreshInterval);
    clearInterval(this.c2dResponseInterval);
    this.signalRTelemetrySubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('telemetry');
    clearInterval(this.c2dResponseInterval);
    this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
