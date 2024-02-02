import { element } from 'protractor';
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
import { ChartService } from 'src/app/services/chart/chart.service';
import * as datefns from 'date-fns';
import { assetMCountInterface } from 'src/app/application/application-gateway-monitoring/count-interface';
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
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;

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
      elementType:"labels",
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
  isdisplayAlertCard: boolean = false;
  selectedAlertObj: any;
  ////Assets Map View end ////

  // Asset List View Start //

  //Status //
  countData: assetMCountInterface = {
    lagecy_count:0,
    gateway_count: 0,
    online: 0,
    offline: 0,
    total_telemetry: 0,
    day_telemetry: 0,

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
  receivedAppName: string;
  isSelectedAppData = false;
  appsList: any = [];
  tableConfig: any;

  // Performance //
  preOffset = 0;
  preLimit = 10;
  dailyReportApiLoading: boolean = false;
  loadMoreVisible = false;
  dailyReportsData = [];
  assetDailyReport: any = [];
  reportBtnData: any = [];
  // Asset List View end //

  // Alert //
  getAlertCountObj: any={};
  acknowledged: boolean = true;
  alertData: any;
  loadingMessage: string;
  chartTbl: any;
  alertCircleTbl = 'critical';
  isGetAssetsAPILoading = false;
  isMapDataLoading = false;
  originalAssets: any[] = [];

  mapOptions = {
    styles: [
      {
        height: 53,
        url: './assets/img/y1.png',
        width: 52
      },
      {
        height: 53,
        url: './assets/img/r1.png',
        width: 52

      }
    ],
    calculator: (markers) => {
      return { text: `<h5 style='color: black; font-size: 16px;margin-top: 17px'>${markers.length}</h5>`, index: this.alertCircleTbl === "critical" ? 2 : 1 }
    },

  }

  alertTabData: any;
  alertTabType = undefined;
  isWarningVisible: boolean = false;


  constructor(
    private assetService: AssetService,
    public commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
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
        this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.mainTab = mTabName;
        this.onSubTabChange('map_view');
      }
      async onSubTabChange(sTabName){ //Inner tab
        this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
        this.subTab = sTabName;
        // this.isdisplayAlertCard = false;
        if( this.mainTab == 'assets'){
          if(sTabName === 'map_view'){
            this.filterObj= {};
            this.assets= [];
            this.configuredHierarchy={};
            this.mapAssets = [];
            this.changeImagePath('m');
            await this.mapViewDataContainer();
          }else{
            this.onChildTabChange('status');
          }
        }
        else{
          //
          if(this.mainTab === 'alerts'){
            this.changeImagePath('r');
            this.onAssetFilterApply(sTabName === 'map_view' ? 'alertMapView' : 'alertListView');
            // this.alertCircleTbl = 'critical';
          }
        }
      }

      onChildTabChange(value){ //Inner Sub Tab
        this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
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
        if(configuredHierarchy)
        this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
      }
      onClearHierarchy(configuredHierarchy: any) {
        if(configuredHierarchy)
        this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
        if(this.subTab === 'list_view' && this.childTab === 'status'){
          this.hierarchy = { App: this.selectedApp };
        }
      }

      async onAssetFilterApply(filterType? , updateFilterObj = true, resetIndex = false) {

        if (updateFilterObj) {
          const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
          pagefilterObj['hierarchy'] = { App: this.contextApp.app };
          Object.keys(this.configuredHierarchy).forEach((key) => {
            if (this.configuredHierarchy[key]) {
              pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
            }
          });
          if(this.filterObj?.asset){
            pagefilterObj['assets'] = this.filterObj?.asset;
            this.hierarchyDropdown?.updateHierarchyDetail(pagefilterObj);
          }
          if(pagefilterObj?.assets && (filterType != 'alertMapView' || filterType!= 'alertListView') )
          delete pagefilterObj.assets;
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
        }
        switch(filterType){
          case 'assets_map': {
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


            if (this.mapAssets.length > 0) {
              this.mapFitBounds = false;
              const center = this.commonService.averageGeolocation(this.mapAssets);
              this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
              this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;
            } else {
              this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
              this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
              this.mapFitBounds = false;
            }
            break;
          }
          case 'assetMoniter': {
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
            break;
          }
          case 'performance':{
            await this.performanceTab();
            break;
          }
          case 'alertMapView': {
            this.alertData = undefined;
            // this.alertCircleTbl = 'critical';
            await this.getAlertCounts();
            this.alertTabData = (this.alertCircleTbl == 'critical') ? this.getAlertCountObj['critical'] : this.getAlertCountObj['warning'];
            // this.onAlertCircleTblChange(this.alertCircleTbl);
            await this.getAlertMapData(this.alertCircleTbl, resetIndex);
            await this.alertMapIconProcessing();
            break;
          }
          case 'alertListView': {
            this.getAllAssets();
            this.alertData = undefined;
            this.alertTabType = undefined;
            // this.alertCircleTbl = 'critical';
            this.getAlertCounts();
            this.getAlertMapData(this.alertCircleTbl, resetIndex);
            break;
          }
          default: {
            this.toasterService.showError('Select Correct Tab', '');
            break;
          }

        }
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

      markerDetails(asset){
        this.isdisplayAlertCard = true;
        this.selectedAlertObj ={
          longitude: asset?.longitude,
          latitude: asset?.latitude,
        }
        this.chartTbl = asset;
        // this.onMarkerClick(infowindow, gm);

      }
      hideNewAlertCard(){
        this.isdisplayAlertCard = false;
      }

      redirectToAsset(asset) {
        this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel']);
      }
      redirectToAssetControlPanel(asset, type) {
        this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel'], { fragment: type});
      }
      redirectToLiveDataHistorical(asset,pageType?) {
        const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        pagefilterObj['assets'] = asset;
        if(!asset?.display_name && asset?.name){
          asset['display_name'] = asset.name;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
        if(pageType === 'dashboard'){
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
        }else{
          this.commonService.setDashboardFilter(pagefilterObj);
        }
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
        } else {
          this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
          this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
          this.mapFitBounds = false;
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
      async changeImagePath(icon:any){
        this.imagePath = ''
        this.imagePath ='./assets/img/'+icon;
        // await this.getAllAssets()
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
        this.isdisplayAlertCard = true;
      }
      async onAlertCircleTblChange(value){
        this.alertTabData = (value == 'critical') ? this.getAlertCountObj['critical'] : this.getAlertCountObj['warning'];
        this.alertCircleTbl = value;
        this.isWarningVisible = (value == 'critical') ? false : true;

        // if(value === 'critical'){
        //   await this.changeImagePath('r');
        // }else{
        //   await this.changeImagePath('y');
        // }
        await this.alertMapViewContainer(true);
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
          provisioned: true
        };
        this.route.queryParams.subscribe((res) => {
          this.receivedAppName = res.appName;
        })

        if (this.userDataFromLocal.is_super_admin) {
          this.apiSubscriptions.push(
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
          )
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
          is_table_data_loading: false,
          table_class: 'table_class_new',
          no_data_message: '',
          data: [
            {
              header_name: 'Asset Id',
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
          this.redirectToLiveDataHistorical(obj.data, obj.for);
        }
        else{
          this.redirectToAssetControlPanel(obj.data, obj.for);
        }
      }

      getHierarchy() {
        if (this.userDataFromLocal.is_super_admin) {
          this.isSelectedAppData = false;
          localStorage.removeItem(CONSTANTS.SELECTED_APP_DATA);
          this.apiSubscriptions.push(
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
            })
          );
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
            lagecy_count:0,
            gateway_count: 0,
            online: 0,
            offline: 0,
            total_telemetry: 0,
            day_telemetry: 0,
          };
          this.applications = []
        }
      }
      assetStatic() {
        const custObj = {
          hierarchy: JSON.stringify(this.hierarchy)
        }
        this.loader = true;
        this.apiSubscriptions.push(
          this.applicationService.getAssetStatisticsNew(this.selectedApp,custObj).subscribe((response: any) => {
            this.countData = {
              lagecy_count: response?.lagecy_count ?? 0,
              gateway_count: response?.gateway_count ?? 0,
              online: response?.online ?? 0,
              offline: response?.offline ?? 0,
              total_telemetry: response?.total_telemetry ?? 0,
              day_telemetry: response?.day_telemetry ?? 0
            }
          }, (err) => { this.loader = false })
        );
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
        this.apiSubscriptions.push(
          this.applicationService.getAssetMonitoringNew(this.selectedApp, custObj,changeState).subscribe((response: any) => {
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
                if (item?.ingestion_status === "Stopped") {
                item.ingestionCss = "offline"
              }
              else {
                item.ingestionCss = "online"
              }
              if (item?.connection_state == "Disconnected") {
                item.connection_state = "Offline"
                item.cssclass = "offline";
                if (item.offline_since) {
                  item.offline_since = 'Offline Since: ' + this.commonService.convertUTCDateToLocalDate(item.offline_since, CONSTANTS.DEFAULT_DATETIME_STR_FORMAT);
                }
              }
              else {
                item.connection_state = "Online"
                item.cssclass = "online";
                if (item?.connection_state == "Online") {
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
        );
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
        this.apiSubscriptions.push(
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
        );

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
        this.apiSubscriptions.push(
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
        );
      }

      closeModal(){
        $('#moreInfoModal').modal('hide');
        this.assetDailyReport = [];
      }
      // performance End //
      // List View End //

      // Alert Start //
      // Alert Map View Start //
       async alertMapViewContainer(resetIndex = false){
        await this.getAlertMapData(this.alertCircleTbl, resetIndex);
        await this.alertMapIconProcessing();
      }

      //get Alert Count
      getAlertCounts(){
        let filterObj = this.commonService.getDefaultDateOptions();
        const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        const obj ={
          from_date: filterObj.from_date,
          to_date: filterObj.to_date,
          hierarchy: JSON.stringify(item.hierarchy),
          // is_telemetry_ts: true
        }
        if(this.filterObj?.asset?.asset_id){
          obj['asset_id'] = this.filterObj?.asset?.asset_id;
          obj['gateway_id'] = this.filterObj?.asset?.gateway_id;
        }
        this.apiSubscriptions.push(
          this.applicationService.getAlertCount(obj).subscribe( (response: any) => {
            if(response?.length){
              response.forEach( (obj: any) =>{
                if(obj?.severity === 'Critical'){
                  this.getAlertCountObj['critical'] = obj;
                }
                if(obj?.severity === 'Warning'){
                  this.getAlertCountObj['warning'] = obj;
                }
              } );
            }else{
              this.getAlertCountObj['critical'] = {
                not_acknowledged_alerts : 0,
                severity : "Critical",
                total_alerts : 0
              };
              this.getAlertCountObj['warning'] = {
                not_acknowledged_alerts : 0,
                severity : "Warning",
                total_alerts : 0
              };
            }
            if(response?.length == 1){
              if(response[0]?.severity != 'Critical'){
                this.getAlertCountObj['critical'] = {
                  not_acknowledged_alerts : 0,
                  severity : "Critical",
                  total_alerts : 0
                };
              }
              if(response[0]?.severity != 'Warning'){
                this.getAlertCountObj['warning'] = {
                  not_acknowledged_alerts : 0,
                  severity : "Warning",
                  total_alerts : 0
                };
              }
            }
          }, (error)=> this.toasterService.showError(error.message, 'Error') )
        );
      }

      // get Alert Data On Click
      async getAlertMapData(alertType?,resetIndex = false){
        this.alertTabType = alertType;
        this.isMapDataLoading = true;
        const filterDate = this.commonService.getDefaultDateOptions();
        const obj ={
          from_date: filterDate.from_date,
          to_date: filterDate.to_date,
          hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
          acknowledged: this.acknowledged ? false : true,
          // severity:( alertType == 'critical') ? 'Critical' : 'Warning'
        }
        if(this.filterObj?.asset?.asset_id){
          obj['asset_id'] = this.filterObj?.asset?.asset_id;
          obj['gateway_id'] = this.filterObj?.asset?.gateway_id;
        }
        if(alertType){
          obj['severity'] = ( alertType == 'critical') ? 'Critical' : 'Warning';
        }
        this.apiSubscriptions.push(
          this.applicationService.getAlerts(obj).subscribe(async (response: any) =>{
            if(response){
              this.alertData = response;
              if(response && (!this.chartTbl?.id || resetIndex)){
                this.chartTbl = response[0];
              }else{
                if(!response){
                  this.chartTbl = null;
                }
              }
              if(this.filterObj?.asset){
                this.alertData = this.alertData.map((newAlert: any) => {
                  if(newAlert?.asset_id == this.filterObj?.asset?.asset_id ){
                    newAlert['asset'] = this.filterObj?.asset;
                    newAlert['metadata'] = this.filterObj?.asset?.metadata;
                    newAlert['latitude'] = this.filterObj?.asset?.latitude;
                    newAlert['longitude'] = this.filterObj?.asset?.longitude;
                    newAlert['connection_state'] = this.filterObj?.asset?.connection_state;
                    return newAlert;
                  }
                });
              }else{
                this.alertData = this.alertData.map((alert: any) => {
                  const temp: any = this.assets.filter((asset: any) => {return asset?.asset_id === alert?.asset_id});
                      alert['metadata'] = temp[0]?.metadata;
                      alert['latitude'] = temp[0]?.latitude;
                      alert['longitude'] = temp[0]?.longitude;
                      alert['connection_state'] = temp[0]?.connection_state;
                      return alert;
                })
              }
              this.mapAssets = JSON.parse(JSON.stringify(this.alertData));
              this.alertMapIconProcessing();

            }
          })
        );

      }

      async alertMapIconProcessing(){
        this.isMapDataLoading = true;
        this.activeCircle = 'all';
            if(this.alertData){
            this.mapAssets =JSON.parse(JSON.stringify(this.alertData));
            this.healthyAssetCount = 0;
            this.unhealthyAssetCount = 0;
            this.alertData.forEach((assetObj) => {
              if (assetObj?.map_content?.healthy === true) {
                this.healthyAssetCount++;
              } else if (assetObj?.map_content?.healthy === false) {
                this.unhealthyAssetCount++;
              }
            });

            this.mapAssets = JSON.parse(JSON.stringify(this.alertData));
                  const data = this.alertData.map((asset) => {
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
                    // if(asset?.severity == this.alertTabData?.severity){
                    //   asset.icon = {
                    //     url:
                    //     (asset?.severity == 'Critical' ? './assets/img/r.png' : asset?.severity == 'Warning' ? './assets/img/y.png' : './assets/img/m.png') ,
                    //     scaledSize: {
                    //       width: 20,
                    //       height: 20,
                    //     },
                    //   };
                    // }
                    if(asset?.severity?.toLowerCase() == 'critical'){
                      asset.icon = {
                        url : './assets/img/red2.gif',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                        class: 'red-glow1'
                      }
                    }else if(asset?.severity?.toLowerCase() == 'warning'){
                      asset.icon = {
                        url : './assets/img/yellow3.gif',
                        scaledSize: {
                          width: 20,
                          height: 20,
                        },
                        class: 'yellow-glow'
                      }
                    }


                    return asset;
                  });
                  this.alertData = JSON.parse(JSON.stringify(data));
                  this.mapAssets = JSON.parse(JSON.stringify(this.alertData));
                  this.isMapDataLoading = false;
                  this.originalAssets = JSON.parse(JSON.stringify(this.alertData));
                  const center = this.commonService.averageGeolocation(this.alertData);
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


            if (this.mapAssets.length > 0) {
              this.mapFitBounds = false;
              const center = this.commonService.averageGeolocation(this.mapAssets);
              this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
              this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;

            } else {
              this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
              this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
              this.mapFitBounds = false;
            }
      }

      // Alert Map View End //
      // Alert List View Start //
      alertListViewContainer(){
        this.getAlertCounts();
      }

       redirectAlertListview(alertData: any){
        const dateConvert: any = this.commonService.convertDateToEpoch(alertData?.message_date);
        const changeDate: Date = new Date(dateConvert * 1000);
        let from_date: any = (changeDate.getTime() - 1000 * 60) / 1000;
        let to_date: any = (changeDate.getTime() + 1000 * 60) / 1000;
        if(alertData?.asset_id){
          const dateFilterObj= {
            dateOption: 'Custom Range',
            from_date: from_date,
            to_date: to_date,
          }
          alertData['dateFilterObj'] = dateFilterObj;

          this.commonService.setDashboardFilter(alertData);
          this.router.navigate(['applications', this.contextApp.app, 'assets', alertData?.asset_id, 'control-panel'], {fragment : 'alert-visualization'});
        }else{
          this.toasterService.showError('Asset Id Not Found','Error');
        }
      }

      convertHierarchyJSONtoPlain(obj: any){
        if(obj){
          let hirrArr: any = [];
          obj = JSON.parse(obj);
          Object.keys(obj).forEach((key: any, index) => {
            hirrArr.push(obj[key]);
          })
          return hirrArr.join('/');
        }
      }
      // Alert List View End //
      // Alert End //
  ngAfterViewInit() {
    if ($('#overlay')) {
      $('#overlay').hide();
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
