import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  filterObj: any = {};
  hierarchyString: any;
  displayHierarchyString: any;
  derivedKPILatestData: any[] = [];
  healthyAssetCount = 0;
  unhealthyAssetCount = 0;
  environmentApp = environment.app;
  activeCircle = 'all';
  mapFitBounds = false;
  zoom = undefined;
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

  constructor(private assetService: AssetService, private router: Router, private commonService: CommonService) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.app === 'CMS_Dev') {
      await this.getLatestDerivedKPIData();
    }
    await this.getAllAssets();
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    console.log(item);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (item) {
      this.loadFromCache(item);
    } else {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
          if (this.contextApp.user.hierarchy[level]) {
            this.onChangeOfHierarchy(index, false);
          }
        }
      });
      this.onAssetFilterApply();
    }
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
    // this.originalFilter = JSON.parse(JSON.stringify(item));
    // this.filterObj = JSON.parse(JSON.stringify(item));
    if (item.hierarchy) {
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
        this.contextApp.hierarchy.levels.forEach((level, index) => {
          if (index !== 0) {
            this.configureHierarchy[index] = item.hierarchy[level];
            console.log(this.configureHierarchy);
            if (item.hierarchy[level]) {
              this.onChangeOfHierarchy(index, true, false);
            }
          }
        });
      }
      this.onAssetFilterApply(false);
    }
  }

  onSaveHierachy() {
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
  }

  onClearHierarchy() {
    console.log('in clear');
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
          console.log('hereeeee');
          this.onChangeOfHierarchy(index, false);
        }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
  }

  getAllAssets() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
        type: this.contextApp.app === 'CMS_Dev' ? CONSTANTS.NON_IP_ASSET : undefined,
      };
      if (this.contextApp.app === 'CMS_Dev') {
        this.healthyAssetCount = 0;
        this.unhealthyAssetCount = 0;
      }
      this.apiSubscriptions.push(
        this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            this.mapAssets = JSON.parse(JSON.stringify(this.assets));
            this.assets.forEach((asset) => {
              if (this.environmentApp === 'KCMS') {
                asset.mttr = '7 Mins';
                asset.mtbf = '2 days 5 hours';
                asset.gas = '0.4%';
                asset.power = '45 SCMH';
              }
              if (this.contextApp.app === 'CMS_Dev') {
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
        })
      );
    });
  }

  async onChangeOfHierarchy(i, flag, persistAssetSelection = true) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
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
      const hierarchyObj: any = { App: this.contextApp.app };

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
        this.originalAssets.forEach((asset) => {
          let trueFlag = 0;
          let flaseFlag = 0;
          Object.keys(hierarchyObj).forEach((hierarchyKey) => {
            if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
              trueFlag++;
            } else {
              flaseFlag++;
            }
          });
          if (trueFlag > 0 && flaseFlag === 0) {
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
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
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

  onAssetFilterBtnClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      console.log('aaaaaaaaaa');
      e.stopPropagation();
    });
    $('#dd-open').on('hide.bs.dropdown', (e: any) => {
      console.log('bbbbbb');
      if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
        console.log('cccccccccc');
        e.preventDefault();
      }
    });
  }

  onAssetFilterApply(updateFilterObj = true) {
    console.log(this.filterObj);
    console.log(this.configureHierarchy);
    this.activeCircle = 'all';
    this.mapAssets = JSON.parse(JSON.stringify(this.assets));
    if (this.contextApp.app === 'CMS_Dev') {
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
    this.onSaveHierachy();

    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = this.configureHierarchy;
      pagefilterObj.hierarchy = { App: this.contextApp.app };
      pagefilterObj.dateOption = 'Last 30 Mins';
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
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
    if (gm.lastOpen != null) {
      gm.lastOpen.close();
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
