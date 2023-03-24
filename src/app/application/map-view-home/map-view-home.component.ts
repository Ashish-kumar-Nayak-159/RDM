import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';
declare var createUnityInstance: any;

@Component({
  selector: 'app-map-view-home',
  templateUrl: './map-view-home.component.html',
  styleUrls: ['./map-view-home.component.css'],
})
export class MapViewHomeComponent implements OnInit, OnDestroy {
  userData: any;
  centerLatitude: any;
  centerLongitude: any;
  assets: any[] = [];
  originalAssets: any[] = [];
  mapAssets: any[] = [];
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  constantData = CONSTANTS;
  filterObj: any = {};
  derivedKPILatestData: any[] = [];
  healthyAssetCount = 0;
  unhealthyAssetCount = 0;
  environmentApp = environment.app;
  blobURL = environment.blobURL;
  blobToken = environment.blobKey;
  activeCircle = 'all';
  mapFitBounds = false;
  zoom = undefined;
  isGetAssetsAPILoading = false;
  decodedToken: any;
  tooltipmapicon:any;
  displayicon:boolean = true;
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
  tileData: any;
  configuredHierarchy: any = {};
  gameInstance: any;
  gameConfig: any;
  displayNameUnityModal: any;
  defaultAppName = environment.app;
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  constructor(private assetService: AssetService, private router: Router, private commonService: CommonService) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Live Data' && item.visible === true) {
        this.displayicon = true;
        this.tooltipmapicon = item.display_name;
      } else if (item.page === 'Live Data' && item.visible === false) {
        this.displayicon = false;
      }
    });
    await this.getAllAssets();
    await this.getAssets(this.contextApp.user.hierarchy);
    setTimeout(() => {
      const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      if (item) {
        this.loadFromCache(item);
      } else {
        this.hierarchyDropdown.updateHierarchyDetail(this.contextApp.user);
        this.onAssetFilterApply();
      }
      this.assets = this.hierarchyDropdown.getAssets();
      if (this.assets.length > 0) {
        const center = this.commonService.averageGeolocation(this.assets);
        this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude;
        this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude;
        if (!center.latitude && !this.contextApp.metadata?.latitude) {
          navigator.geolocation.getCurrentPosition(this.showPosition)
        }
        if (!this.centerLatitude || !this.centerLongitude) {

          this.centerLatitude = 23.0225;
          this.centerLongitude = 72.5714;
        }
        this.mapFitBounds = false;
      }
      else {
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
    }, 200);
  }

  showPosition = (position) => {
    this.centerLatitude = position?.coords?.latitude || this.centerLatitude;
    this.centerLongitude = position.coords.longitude || this.centerLongitude;
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Home') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
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

  loadFromCache(item) {
    this.hierarchyDropdown.updateHierarchyDetail(item);
    if (item.hierarchy) {
      this.assets = this.hierarchyDropdown.getAssets();
      this.onAssetFilterApply(false);
    }
  }

  onSaveHierachy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
  }

  onClearHierarchy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
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
                  asset.icon = {
                    url: this.contextApp?.dashboard_config?.map_icons?.legacy_asset?.healthy?.url
                      ? this.blobURL +
                      this.contextApp?.dashboard_config?.map_icons?.legacy_asset?.healthy?.url +
                      this.blobToken
                      : './assets/img/legacy-assets.svg',
                    scaledSize: {
                      width: 20,
                      height: 20,
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

  onAssetFilterApply(updateFilterObj = true) {
    this.activeCircle = 'all';
    this.assets = this.hierarchyDropdown.getAssets();
    this.mapAssets = JSON.parse(JSON.stringify(this.assets));
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

  onSelect() {
    this.assets = JSON.parse(JSON.stringify(this.filterObj.asset));
  }

  onMarkerClick(infowindow, gm) {
    if (gm?.lastOpen != null) {
      gm.lastOpen?.close();
    }
    gm.lastOpen = infowindow;
    infowindow.open();
  }

  onMarkerMouseOut(infowindow, gm) {
    gm.lastOpen = null;
    infowindow.close();
  }

  redirectToAsset(asset) {
    this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel']);
  }

  redirectToLiveData(asset) {
    const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    pagefilterObj['hierarchy'] = asset.hierarchy;
    pagefilterObj['assets'] = asset;
    this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    this.router.navigate(['applications', this.contextApp.app, 'dashboard']);
  }
  onSave(asset){
    this.displayNameUnityModal = asset;
      // Hide by defualt unity card
      // $(".unity-modal-card").addClass("d-none");

      // Show Card
      // $(".open-unity-card").click(function () {
        $(".unity-modal-card").removeClass("d-none");
        $(".unity-modal-card").addClass("d-block");
        $(".unity-backdrop").removeClass("d-none");
        $(".unity-backdrop").addClass("d-block");

        $(".unity-backdrop").click(() =>{
          $(".pswp__button--close").css("background-color", "#ff0000");
          $(".close-unity-card").css("fill", "#ffffff");
          setTimeout(() => {
            $(".pswp__button--close").css("background-color", "#000000");
            $(".close-unity-card").css("fill", "#ffffff");
           }, 1000);
        });
        var buildUrl = "assets/Build";
        var loaderUrl = buildUrl + "/KemsysBuild.loader.js";
    
        this.gameConfig = {
          dataUrl: buildUrl + "/KemsysBuild.data",
          frameworkUrl: buildUrl + "/KemsysBuild.framework.js",
          codeUrl: buildUrl + "/KemsysBuild.wasm",
          // streamingAssetsUrl: "StreamingAssets",
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
        var script = document.createElement("script");
        var canvas = document.querySelector("#unity-canvas");   
        createUnityInstance(document.querySelector("#unity-canvas"),this.gameConfig).then((unityInstance) => {  
          this.gameInstance = unityInstance;
        });
  }
  onClose(){
    $(".unity-modal-card").addClass("d-none");
    $(".unity-modal-card").removeClass("d-block");
    $(".unity-backdrop").addClass("d-none");
    $(".unity-backdrop").removeClass("d-block");
    this.gameInstance.Quit();
    this.gameInstance = null;
  }

  redirectToFirstMenu() {
    const menu =
      this.contextApp.menu_settings.main_menu.length > 0
        ? this.contextApp.menu_settings.main_menu
        : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
    let i = 0;
    menu.forEach((menuObj) => {
      if (i === 0 && menuObj.visible) {
        i++;
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.contextApp.app);
          this.router.navigateByUrl(menuObj.url);
        }
      }
    });
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((su) => su.unsubscribe());
  }
}
