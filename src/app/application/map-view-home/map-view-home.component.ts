import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';
import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

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
  activeCircle = 'all';
  mapFitBounds = false;
  zoom = undefined;
  isGetAssetsAPILoading = false;
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
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  constructor(private assetService: AssetService, private router: Router, private commonService: CommonService) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp?.user?.hierarchy) {
      this.contextAppUserHierarchyLength = Object.keys(this.contextApp.user.hierarchy).length;
    }
    if (this.environmentApp === 'SopanCMS') {
      await this.getLatestDerivedKPIData();
    }
    await this.getAllAssets();
    setTimeout(() => {
      const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      if (item) {
        console.log(this.assets);
        this.loadFromCache(item);
      } else {
        this.hierarchyDropdown.updateHierarchyDetail(this.contextApp.user);
        this.onAssetFilterApply();
      }
    }, 200);
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
        type: this.environmentApp === 'SopanCMS' ? CONSTANTS.NON_IP_ASSET : undefined,
      };
      if (this.environmentApp === 'SopanCMS') {
        this.healthyAssetCount = 0;
        this.unhealthyAssetCount = 0;
      }
      this.apiSubscriptions.push(
        this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
          (response: any) => {
            if (response?.data) {
              this.assets = response.data;
              this.mapAssets = JSON.parse(JSON.stringify(this.assets));
              this.isGetAssetsAPILoading = false;
              this.assets.forEach((asset) => {
                if (this.environmentApp === 'KCMS') {
                  asset.mttr = '7 Mins';
                  asset.mtbf = '2 days 5 hours';
                  asset.gas = '0.4%';
                  asset.power = '45 SCMH';
                }
                if (this.environmentApp === 'SopanCMS') {
                  this.derivedKPILatestData.forEach((kpiObj) => {
                    if (asset.asset_id === kpiObj.asset_id) {
                      asset.kpiValue = kpiObj?.metadata?.healthy;
                      asset.spcd = kpiObj?.metadata?.specific_power_consumption_discharge;
                      console.log(kpiObj?.metadata?.healthy);
                      if (kpiObj?.metadata?.healthy === true) {
                        this.healthyAssetCount++;
                        console.log('healthy');
                      } else if (kpiObj?.metadata?.healthy === false) {
                        this.unhealthyAssetCount++;
                        console.log('unhealthy');
                      }
                    }
                  });
                  if (asset.type === this.constantData.NON_IP_ASSET) {
                    asset.icon = {
                      url:
                        asset.kpiValue === true
                          ? './assets/img/legacy-asset-green.svg'
                          : asset.kpiValue === false
                          ? './assets/img/legacy-asset-red.svg'
                          : './assets/img/legacy-assets.svg',
                      scaledSize: {
                        width: 25,
                        height: 25,
                      },
                    };
                  }
                } else {
                  if (
                    asset.type === this.constantData.IP_ASSET &&
                    asset?.connection_state?.toLowerCase() === 'connected'
                  ) {
                    asset.icon = {
                      url: './assets/img/iot-assets-green.svg',
                      scaledSize: {
                        width: 35,
                        height: 35,
                      },
                    };
                  } else if (
                    asset.type === this.constantData.IP_ASSET &&
                    asset?.connection_state?.toLowerCase() === 'disconnected'
                  ) {
                    asset.icon = {
                      url: './assets/img/iot-assets-red.svg',
                      scaledSize: {
                        width: 35,
                        height: 35,
                      },
                    };
                  } else if (
                    asset.type === this.constantData.IP_GATEWAY &&
                    asset?.connection_state?.toLowerCase() === 'connected'
                  ) {
                    asset.icon = {
                      url: './assets/img/iot-gateways-green.svg',
                      scaledSize: {
                        width: 30,
                        height: 30,
                      },
                    };
                  } else if (
                    asset.type === this.constantData.IP_GATEWAY &&
                    asset?.connection_state?.toLowerCase() === 'disconnected'
                  ) {
                    asset.icon = {
                      url: './assets/img/iot-gateways-red.svg',
                      scaledSize: {
                        width: 30,
                        height: 30,
                      },
                    };
                  } else if (asset.type === this.constantData.NON_IP_ASSET) {
                    asset.icon = {
                      url: './assets/img/legacy-assets.svg',
                      scaledSize: {
                        width: 25,
                        height: 25,
                      },
                    };
                  }
                }
                console.log(asset.asset_id, '=====', asset.icon);
              });
              this.originalAssets = JSON.parse(JSON.stringify(this.assets));
              const center = this.commonService.averageGeolocation(this.assets);
              this.centerLatitude = center?.latitude || 23.0225;
              this.centerLongitude = center?.longitude || 72.5714;
            }

            resolve();
          },
          (error) => (this.isGetAssetsAPILoading = false)
        )
      );
    });
  }

  getLatestDerivedKPIData() {
    return new Promise<void>((resolve) => {
      const derivedKPICode = 'SPCD';
      const obj = {
        from_date: moment().subtract(24, 'hours').utc().unix(),
        to_date: moment().utc().unix(),
        epoch: true,
      };
      this.apiSubscriptions.push(
        this.assetService
          .getDerivedKPILatestData(this.contextApp.app, derivedKPICode, obj)
          .subscribe((response: any) => {
            if (response?.data) {
              this.derivedKPILatestData = response.data;
            }
            resolve();
          })
      );
    });
  }

  onClickOfCount(type) {
    const arr = [];
    this.activeCircle = type;
    if (type !== 'all') {
      this.assets.forEach((asset) => {
        console.log(asset.kpiValue === false);
        if (type === 'healthy' && asset.kpiValue === true) {
          arr.push(asset);
        }
        if (type === 'unhealthy' && asset.kpiValue === false) {
          arr.push(asset);
        }
      });

      this.mapAssets = JSON.parse(JSON.stringify(arr));
    } else {
      this.mapAssets = JSON.parse(JSON.stringify(this.assets));
    }
    if (this.mapAssets.length === 0) {
      this.mapFitBounds = false;
      const center = this.commonService.averageGeolocation(this.mapAssets);
      this.centerLatitude = center?.latitude || 23.0225;
      this.centerLongitude = center?.longitude || 72.5714;
      // this.zoom = 5;
    } else {
      this.mapFitBounds = true;
      // this.zoom = undefined;
    }
  }

  onAssetFilterApply(updateFilterObj = true) {
    this.activeCircle = 'all';
    this.assets = this.hierarchyDropdown.getAssets();
    this.mapAssets = JSON.parse(JSON.stringify(this.assets));
    console.log(this.mapAssets);
    if (this.environmentApp === 'SopanCMS') {
      this.healthyAssetCount = 0;
      this.unhealthyAssetCount = 0;
      this.assets.forEach((assetObj) => {
        this.derivedKPILatestData.forEach((kpiObj) => {
          if (assetObj.asset_id === kpiObj.asset_id) {
            assetObj.kpiValue = kpiObj?.metadata?.healthy;
            if (kpiObj?.metadata?.healthy === true) {
              this.healthyAssetCount++;
            } else if (kpiObj?.metadata?.healthy === false) {
              this.unhealthyAssetCount++;
            }
          }
        });
      });
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = { App: this.contextApp.app };
      pagefilterObj.dateOption = 'Last 30 Mins';
      Object.keys(this.configuredHierarchy).forEach((key) => {
        if (this.configuredHierarchy[key]) {
          pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configuredHierarchy[key];
        }
      });
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    if (this.mapAssets.length === 0) {
      this.mapFitBounds = false;
      const center = this.commonService.averageGeolocation(this.mapAssets);
      this.centerLatitude = center?.latitude || 23.0225;
      this.centerLongitude = center?.longitude || 72.5714;
      // this.zoom = 8;
    } else {
      this.mapFitBounds = true;
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

  ngOnDestroy() {
    this.apiSubscriptions.forEach((su) => su.unsubscribe());
  }
}
