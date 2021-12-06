
import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AssetListFilter } from 'src/app/models/asset.model';
import { Router } from '@angular/router';
import { AssetService } from './../../services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ToasterService } from './../../services/toaster.service';
import * as am4charts from '@amcharts/amcharts4/charts';
import { HierarchyDropdownComponent } from './../../common/hierarchy-dropdown/hierarchy-dropdown.component';
declare var $: any;
@Component({
  selector: 'app-asset-list',
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css'],
})
export class AssetListComponent implements OnInit, OnDestroy {
  assetFilterObj: AssetListFilter = new AssetListFilter();
  originalAssetFilterObj: AssetListFilter = new AssetListFilter();
  assetsList: any[] = [];
  isAssetListLoading = false;
  userData: any;
  isFilterSelected = false;
  assetDetail: any;
  isCreateAssetAPILoading = false;
  protocolList: any[] = [];
  connectivityList: any[] = [];
  componentState: string; // value must be IP Assets & Gateways or IP Asset or IP Gateway or Non IP Assets
  constantData = CONSTANTS;
  originalSingularComponentState: string;
  gateways: any[];
  originalGateways: any[] = [];
  tableConfig: any;
  gatewayId: string;
  contextApp: any;
  assetModels: any[] = [];
  tileData: any;
  subscriptions: Subscription[] = [];
  appUsers: any[] = [];
  currentOffset = 0;
  currentLimit = 20;
  insideScrollFunFlag = false;
  iotAssetsPage = 'Assets';
  legacyAssetsPage = 'Non IP Assets';
  iotGatewaysPage = 'Gateways';
  currentPageView = 'list';
  centerLatitude: any;
  centerLongitude: any;
  isOpenAssetCreateModal = false;
  selectedAssetForEdit: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
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
  derivedKPILatestData: any[] = [];
  assetListAPISubscription: Subscription;
  isDerivedKPIDataLoading = false;
  derivedKPIData: any[] = [];
  loader = false;
  mapFitBounds = false;
  loadingMessage = 'Loading Data. Please wait...';
  chart: am4charts.XYChart;
  environmentApp = environment.app;
  originalAssetsList: any[] = [];
  contextAppUserHierarchyLength = 0;
  configuredHierarchy: any = {};
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  blobURL = environment.blobURL;
  blobToken = environment.blobKey;
  constructor(
    private router: Router,
    private assetService: AssetService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.assetsList = [];
    this.getTileName();
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
    if (item?.type) {
      this.onTabChange(item.type);
    } else {
      if (this.iotAssetsTab?.visibility) {
        this.onTabChange(CONSTANTS.IP_ASSET);
      } else if (this.legacyAssetsTab?.visibility) {
        this.onTabChange(CONSTANTS.NON_IP_ASSET);
      } else if (this.iotGatewaysTab?.visibility) {
        this.onTabChange(CONSTANTS.IP_GATEWAY);
      }
    }
    localStorage.removeItem(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
    this.protocolList = CONSTANTS.PROTOCOLS;
  }

  async loadFromCache(item) {
    console.log('inside load from cache',item);
    this.hierarchyDropdown.updateHierarchyDetail(item);
    this.searchAssets(false);
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

  async onTabChange(type) {
    this.assetListAPISubscription?.unsubscribe();
    this.assetsList = [];
    this.currentOffset = 0;
    this.currentLimit = 20;
    this.insideScrollFunFlag = false;
    this.isFilterSelected = false;
    this.currentPageView = 'list';
    this.assetFilterObj = new AssetListFilter();
    this.assetFilterObj.app = this.contextApp.app;
    this.assetFilterObj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
    const item1 = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
    if (item1?.gateway_id) {
      this.assetFilterObj.gateway_id = item1.gateway_id;
    }
    if (item1?.asset_model) {
      this.assetFilterObj.asset_model = item1.asset_model;
    }
    localStorage.removeItem(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
    this.assetFilterObj.hierarchyString = this.contextApp.user.hierarchyString;
    this.originalAssetFilterObj = JSON.parse(JSON.stringify(this.assetFilterObj));
    if (type === CONSTANTS.NON_IP_ASSET) {
      this.getGatewayList();
    }
    this.componentState = type;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      this.assetFilterObj.type = undefined;
    } else {
      this.assetFilterObj.type = this.componentState;
    }

    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (
          parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
            parseFloat(element.scrollHeight.toFixed(0)) &&
          !this.insideScrollFunFlag
        ) {
          this.currentOffset += this.currentLimit;
          this.searchAssets(false);
          this.insideScrollFunFlag = true;
        }
      });
      const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    this.assetsList = [];
    console.log('item',item);
    if (item) {
      this.loadFromCache(item);
    } else {
      this.hierarchyDropdown.updateHierarchyDetail(this.contextApp.user);
      this.searchAssets();
    }
    }, 2000);
    this.tableConfig = undefined;
    const obj =
      this.componentState === CONSTANTS.IP_ASSET
        ? this.iotAssetsTab
        : this.componentState === CONSTANTS.NON_IP_ASSET
        ? this.legacyAssetsTab
        : this.componentState === CONSTANTS.IP_GATEWAY
        ? this.iotGatewaysTab
        : {};
    this.tableConfig = {
      type: obj.tab_name,
      is_load_more_required: true,
      item_count: this.currentLimit,
      is_table_data_loading: this.isAssetListLoading,
      no_data_message: '',
      table_class: 'tableFixHead-assets-list',
      border_left_key: true,
      data: [
        {
          header_name: (obj.table_key || '') + ' Name',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'display_name',
        },
        {
          header_name: (obj.table_key || '') + ' Manager',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'asset_manager',
        },
        {
          header_name: 'Status',
          is_display_filter: false,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'connection_state',
        },
        {
          header_name: 'Hierarchy',
          is_display_filter: true,
          value_type: 'string',
          is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'hierarchyString',
        },
        {
          header_name: 'Actions',
          key: undefined,
          data_type: 'button',
          btn_list: [
            {
              icon: 'fa fa-fw fa-table',
              text: '',
              id: 'View Control Panel',
              valueclass: '',
              tooltip: this.componentState === CONSTANTS.IP_GATEWAY ? 'View Diagnosis Panel' : 'View Control panel',
            },
          ],
        },
      ],
    };
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      this.tableConfig.data.splice(2, 1);
      this.tableConfig.data.splice(this.tableConfig.data.length - 2, 0, {
        header_name: 'Reporting Via GW',
        is_display_filter: true,
        value_type: 'string',
        is_sort_required: true,
        fixed_value_list: [],
        data_type: 'text',
        data_key: 'gateway_display_name',
      });

      // this.tableConfig.data[4].btn_list.splice(0, 0, {
      //   icon: 'fa fa-fw fa-edit',
      //   text: '',
      //   id: 'Edit',
      //   valueclass: '',
      //   tooltip: 'Edit',
      // })
      this.tableConfig.data[4].btn_list.push({
        icon: 'fa fa-fw fa-book',
        text: '',
        id: 'View Diagnosis Panel',
        valueclass: '',
        tooltip: 'View Diagnosis panel',
      });
    }    
  }

  onCurrentPageViewChange(type) {
    console.log(type);
    if (type === 'map') {
      console.log('here');
      if (this.assetsList.length > 0) {
        this.mapFitBounds = false;
        const center = this.commonService.averageGeolocation(this.assetsList);
        this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
        this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;
        // this.zoom = 8;
      } else {
        this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
        this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
        this.mapFitBounds = false;
        // this.zoom = undefined;
      }
    }
    this.currentPageView = type;
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = {};
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: this.tileData['IoT Assets'],
      tab_name: this.tileData['IoT Assets Tab Name'],
      table_key: this.tileData['IoT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      visibility: this.tileData['Legacy Assets'],
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      visibility: this.tileData['IoT Gateways'],
      tab_name: this.tileData['IoT Gateways Tab Name'],
      table_key: this.tileData['IoT Gateways Table Key Name'],
    };
    this.currentLimit = Number(this.tileData[2]?.value) || 20;
  }

  async openAssetEditModal(asset) {
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      this.getGatewayList();
    }
    await this.getAssetData(asset.asset_id);
    this.isOpenAssetCreateModal = true;
  }

  onEditAssetCancelModal() {
    this.isOpenAssetCreateModal = false;
    this.selectedAssetForEdit = undefined;
  }

  getAssetData(assetId) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        asset_id: assetId,
      };
      const methodToCall = this.assetService.getAssetDetailById(obj.app, obj.asset_id);
      this.subscriptions.push(
        methodToCall.subscribe((response: any) => {
          this.selectedAssetForEdit = response;
          resolve();
        })
      );
    });
  }

  getGatewayList() {
    this.gateways = [];
    this.originalGateways = [];
    const obj = {
      app: this.contextApp.app,
      type: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      map_content: true,
    };
    this.subscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe((response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
          this.assetsList.forEach((item) => {
            const name = this.gateways.filter((gateway) => gateway.asset_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      })
    );
  }

  redirectToGatewayPanel(asset) {
    if (asset.gateway_id) {
      this.router.navigate(['applications', this.contextApp.app, 'assets', asset.gateway_id, 'control-panel']);
    } else {
      this.toasterService.showError('Gateway Id is not available in selected Asset', 'Redirection to Gateway Panel');
      return;
    }
  }

  loadMoreAssets() {
    this.currentOffset += this.currentLimit;
    this.searchAssets(false);
    this.insideScrollFunFlag = true;
  }

  searchAssets(updateFilterObj = true) {
    this.tableConfig.is_table_data_loading = true;
    this.isAssetListLoading = true;
    this.isFilterSelected = true;
    const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
    const obj = JSON.parse(JSON.stringify(this.assetFilterObj));
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    obj.map_content = true;
    if (this.contextApp) {
      obj.hierarchy = { App: this.contextApp.app };
      Object.keys(configuredHierarchy).forEach((key) => {
        if (configuredHierarchy[key]) {
          obj.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
        }
      });
      obj.hierarchy = JSON.stringify(obj.hierarchy);
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = JSON.parse(obj.hierarchy);
      delete pagefilterObj.assets;
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    delete obj.gatewayArr;
    delete obj.hierarchyString;
    if (obj.status && obj.status.toLowerCase().includes('connected')) {
      obj.connection_state = obj.status;
      delete obj.status;
    }
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      obj.type = CONSTANTS.NON_IP_ASSET;
    }
    const methodToCall = this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app);
    this.assetListAPISubscription = methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          response.data.forEach((item) => {
            if (!item.display_name) {
              item.display_name = item.asset_id;
            }
            // item.asset_manager_users = item.asset_manager?.split(',');
            if (this.componentState === CONSTANTS.NON_IP_ASSET) {
              const name = this.gateways.filter((gateway) => gateway.asset_id === item.gateway_id)[0]?.display_name;
              item.gateway_display_name = name ? name : item.gateway_id;
            }
            if (this.environmentApp === 'KCMS') {
              item.mttr = '7 Mins';
              item.mtbf = '2 days 5 hours';
              item.gas = '0.4%';
              item.power = '45 SCMH';
            }
            if (
              this.componentState === this.constantData.IP_ASSET &&
              item?.connection_state?.toLowerCase() === 'connected'
            ) {
              item.icon = {
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
              this.componentState === this.constantData.IP_ASSET &&
              item?.connection_state?.toLowerCase() === 'disconnected'
            ) {
              item.icon = {
                url: './assets/img/assets-red.gif',
                scaledSize: {
                  width: 20,
                  height: 20,
                },
              };
            } else if (
              this.componentState === this.constantData.IP_GATEWAY &&
              item?.connection_state?.toLowerCase() === 'connected'
            ) {
              console.log('11111111111111111111111111');
              item.icon = {
                url: './assets/img/iot-gateways-green.svg',
                scaledSize: {
                  width: 20,
                  height: 20,
                },
              };
            } else if (
              this.componentState === this.constantData.IP_GATEWAY &&
              item?.connection_state?.toLowerCase() === 'disconnected'
            ) {
              item.icon = {
                url: './assets/img/assets-red.gif',
                scaledSize: {
                  width: 20,
                  height: 20,
                },
              };
            } else if (this.componentState === this.constantData.NON_IP_ASSET) {
              item.icon = {
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
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] ? item.hierarchy[key] + (keys[index + 1] ? ' / ' : '') : '';
              });
            }
            console.log(item.asset_id, '=====', item.icon);
          });
          this.assetsList = [...this.assetsList, ...response.data];
          this.originalAssetsList = JSON.parse(JSON.stringify(this.assetsList));
          if (this.assetsList.length > 0) {
            this.mapFitBounds = false;
            const center = this.commonService.averageGeolocation(this.assetsList);
            this.centerLatitude = center?.latitude || this.contextApp.metadata?.latitude || 23.0225;
            this.centerLongitude = center?.longitude || this.contextApp.metadata?.longitude || 72.5714;
            // this.zoom = 8;
          } else {
            this.centerLatitude = this.contextApp.metadata?.latitude || 23.0225;
            this.centerLongitude = this.contextApp.metadata?.longitude || 72.5714;
            this.mapFitBounds = false;
            // this.zoom = undefined;
          }
        }
        if (response.data.length === this.currentLimit) {
          this.insideScrollFunFlag = false;
        } else {
          this.insideScrollFunFlag = true;
        }
        this.tableConfig.is_table_data_loading = false;
        this.isAssetListLoading = false;
      },
      () => {
        this.isAssetListLoading = false;
        this.tableConfig.is_table_data_loading = false;
        this.insideScrollFunFlag = false;
      }
    );
  }

  onSaveHierachy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
  }

  onClearHierarchy(configuredHierarchy) {
    this.configuredHierarchy = JSON.parse(JSON.stringify(configuredHierarchy));
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View Control Panel') {
      this.router.navigate(['applications', this.contextApp.app, 'assets', obj.data.asset_id, 'control-panel']);
    } else if (obj.for === 'View Diagnosis Panel') {
      this.redirectToGatewayPanel(obj.data);
    } else if (obj.for === 'Edit') {
      this.openAssetEditModal(obj.data);
    }
  }

  redirectToAsset(asset) {
    this.router.navigate(['applications', this.contextApp.app, 'assets', asset.asset_id, 'control-panel']);
  }

  onAssetSelection() {
    if (this.assetFilterObj?.gatewayArr.length > 0) {
      this.assetFilterObj.gateway_id = this.assetFilterObj.gatewayArr[0].asset_id;
    } else {
      this.assetFilterObj.gateway_id = undefined;
      this.assetFilterObj.gatewayArr = undefined;
    }
  }

  onAssetDeselect() {
    this.assetFilterObj.gateway_id = undefined;
    this.assetFilterObj.gatewayArr = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.assetListAPISubscription?.unsubscribe();
  }
}
