import { environment } from './../../../environments/environment';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeviceListFilter, Device } from 'src/app/models/device.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService } from './../../services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { ToasterService } from './../../services/toaster.service';
import * as moment from 'moment';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
declare var $: any;
@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
})
export class DeviceListComponent implements OnInit, OnDestroy {
  deviceFilterObj: DeviceListFilter = new DeviceListFilter();
  originalDeviceFilterObj: DeviceListFilter = new DeviceListFilter();
  devicesList: any[] = [];
  isDeviceListLoading = false;
  userData: any;
  isFilterSelected = false;
  deviceDetail: any;
  isCreateDeviceAPILoading = false;
  protocolList: any[] = [];
  connectivityList: any[] = [];
  componentState: string; // value must be IP Devices & Gateways or IP Device or IP Gateway or Non IP Devices
  constantData = CONSTANTS;
  originalSingularComponentState: string;
  gateways: any[];
  originalGateways: any[] = [];
  tableConfig: any;
  deviceCategory = CONSTANTS.NON_IP_DEVICE_OPTIONS;
  gatewayId: string;
  contextApp: any;
  hierarchyDropdown: any[] = [];
  deviceTypes: any[] = [];
  tileData: any;
  hierarchyArr = {};
  configureHierarchy = {};
  subscriptions: Subscription[] = [];
  appUsers: any[] = [];
  currentOffset = 0;
  currentLimit = 20;
  insideScrollFunFlag = false;
  iotDevicesPage = 'Assets';
  legacyDevicesPage = 'Non IP Assets';
  iotGatewaysPage = 'Gateways';
  currentPageView = 'list';
  centerLatitude: any;
  centerLongitude: any;
  isOpenDeviceCreateModal = false;
  selectedDeviceForEdit: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  hierarchyString: string;
  displayHierarchyString: string;
  customMapStyle =  [
    {
      featureType: 'poi',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'transit',
      stylers: [
        { visibility: 'off' }
      ]
    },
   {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    }
  ];
  derivedKPILatestData: any[] = [];
  deviceListAPISubscription: Subscription;
  isDerivedKPIDataLoading = false;
  derivedKPIData: any[] = [];
  loader = false;
  mapFitBounds = false;
  loadingMessage = 'Loading Data. Please wait...';
  chart: am4charts.XYChart;
  environmentApp = environment.app;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(
      CONSTANTS.USER_DETAILS
    );
    this.contextApp = this.commonService.getItemFromLocalStorage(
      CONSTANTS.SELECTED_APP_DATA
    );
    this.devicesList = [];
    await this.getTileName();
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
    if (item?.gateway_id) {
      this.deviceFilterObj.gateway_id = item.gateway_id;
      this.onTabChange(CONSTANTS.NON_IP_DEVICE);
    } else {
    if (this.iotAssetsTab?.visibility) {
      this.onTabChange(CONSTANTS.IP_DEVICE);
    } else if (this.legacyAssetsTab?.visibility) {
      this.onTabChange(CONSTANTS.NON_IP_DEVICE);
    } else if (this.iotGatewaysTab?.visibility) {
      this.onTabChange(CONSTANTS.IP_GATEWAY);
    }
    }
    localStorage.removeItem(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }

    this.protocolList = CONSTANTS.PROTOCOLS;
    // const keys = Object.keys(this.contextApp.user.hierarchy);
    this.hierarchyDropdown = [];
    //  this.commonService.setFlag(true);
  }

  loadFromCache(item) {
    if (item.hierarchy) {
    if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          console.log(index);
          console.log(level);
          this.configureHierarchy[index] = item.hierarchy[level];
          console.log(this.configureHierarchy);
          if (item.hierarchy[level]) {
            this.onChangeOfHierarchy(index);
          }
        }
      });
    }
    }
    this.searchDevices(false);
  }

  onDeviceFilterBtnClick() {
    $('.dropdown-menu').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
  }

  onChangeOfHierarchy(i) {
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
    const hierarchyObj: any = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] =
          this.configureHierarchy[key];
      }
    });
    if (Object.keys(hierarchyObj).length === 1) {
      this.gateways = JSON.parse(JSON.stringify(this.originalGateways));
    } else {
      const arr = [];
      this.gateways = [];
      this.originalGateways.forEach((device) => {
        let flag = false;
        Object.keys(hierarchyObj).forEach((hierarchyKey) => {
          if (
            device.hierarchy[hierarchyKey] &&
            device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]
          ) {
            flag = true;
          } else {
            flag = false;
          }
        });
        if (flag) {
          arr.push(device);
        }
      });
      this.gateways = JSON.parse(JSON.stringify(arr));
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
    this.deviceListAPISubscription?.unsubscribe();
    this.devicesList = [];
    this.currentOffset = 0;
    this.currentLimit = 20;
    this.insideScrollFunFlag = false;
    this.isFilterSelected = false;
    this.currentPageView = 'list';
    this.deviceFilterObj = new DeviceListFilter();
    this.deviceFilterObj.app = this.contextApp.app;
    this.deviceFilterObj.hierarchy = JSON.stringify(
      this.contextApp.user.hierarchy
    );
    const item1 = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
    if (item1?.gateway_id) {
      this.deviceFilterObj.gateway_id = item1.gateway_id;
    }
    localStorage.removeItem(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
    this.deviceFilterObj.hierarchyString = this.contextApp.user.hierarchyString;
    this.originalDeviceFilterObj = JSON.parse(
      JSON.stringify(this.deviceFilterObj)
    );
    if (type === CONSTANTS.NON_IP_DEVICE) {
      this.getGatewayList();
    }
    this.componentState = type;
    // if (environment.app === 'SopanCMS') {

    if (this.contextApp.app === 'CMS_Dev' && this.componentState === CONSTANTS.NON_IP_DEVICE) {
      await this.getLatestDerivedKPIData();
    }

    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.deviceFilterObj.type = undefined;
    } else {
      this.deviceFilterObj.type = this.componentState;
    }

    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (
          parseFloat(element.scrollTop.toFixed(0)) +
            parseFloat(element.clientHeight.toFixed(0)) >=
            parseFloat(element.scrollHeight.toFixed(0)) &&
          !this.insideScrollFunFlag
        ) {
          this.currentOffset += this.currentLimit;
          this.searchDevices(false);
          this.insideScrollFunFlag = true;
        }
      });
    }, 2000);
    this.tableConfig = undefined;
    const obj =
      this.componentState === CONSTANTS.IP_DEVICE
        ? this.iotAssetsTab
        : this.componentState === CONSTANTS.NON_IP_DEVICE
        ? this.legacyAssetsTab
        : this.componentState === CONSTANTS.IP_GATEWAY
        ? this.iotGatewaysTab
        : {};
    this.tableConfig = {
      type: obj.tab_name,
      is_load_more_required: true,
      item_count: this.currentLimit,
      is_table_data_loading: this.isDeviceListLoading,
      no_data_message: '',
      table_class: 'tableFixHead-assets-list',
      border_left_key: this.contextApp.app === 'CMS_Dev' && this.componentState === CONSTANTS.NON_IP_DEVICE ? 'kpiValue' : undefined,
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
          data_type: 'list',
          data_key: 'device_manager_users',
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
              tooltip: 'View Control panel',
            },
          ],
        },
      ],
    };
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.tableConfig.data.splice(this.tableConfig.data.length - 2, 0, {
        header_name: 'Reporting Via GW',
        is_display_filter: true,
        value_type: 'string',
        is_sort_required: true,
        fixed_value_list: [],
        data_type: 'text',
        data_key: 'gateway_display_name',
      });

      this.tableConfig.data[4].btn_list.splice(0, 0, {
        icon: 'fa fa-fw fa-edit',
        text: '',
        id: 'Edit',
        valueclass: '',
        tooltip: 'Edit',
      });
      if (this.contextApp.app === 'CMS_Dev') {
        this.tableConfig.data[4].btn_list.splice(0, 0, {
          icon: 'fa fa-fw fa-eye',
          text: '',
          id: 'View Device Status',
          valueclass: '',
          tooltip: 'View Specific Power Consumption',
        });
      }
      this.tableConfig.data[4].btn_list.push({
        icon: 'fa fa-fw fa-book',
        text: '',
        id: 'View Gateway Panel',
        valueclass: '',
        tooltip: 'View Gateway panel',
      });

    }
    const item = this.commonService.getItemFromLocalStorage(
      CONSTANTS.MAIN_MENU_FILTERS
    );
    this.devicesList = [];
    console.log(item);
    if (item) {
      this.loadFromCache(item);
    } else {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.configureHierarchy[index] =
            this.contextApp.user.hierarchy[level];
          if (this.contextApp.user.hierarchy[level]) {
            this.onChangeOfHierarchy(index);
          }
        }
      });
      this.searchDevices();
    }
  }

  getLatestDerivedKPIData() {
    return new Promise<void>((resolve) => {
      this.isDeviceListLoading = true;
      const derivedKPICode = 'SPCD';
      const obj = {
        from_date: moment().subtract(24, 'hours').utc().unix(),
        to_date: moment().utc().unix(),
        epoch: true,
        asset_model: 'Hydraulic Booster Compressor 1.2'
      };
      this.subscriptions.push(this.deviceService.getDerivedKPILatestData(this.contextApp.app, derivedKPICode, obj)
      .subscribe((response: any) => {
        if (response?.data) {
          this.derivedKPILatestData = response.data;
          this.devicesList.forEach(deviceObj => {
            this.derivedKPILatestData.forEach(kpiObj => {
              if (deviceObj.device_id === kpiObj.device_id) {
                deviceObj.kpiValue = kpiObj?.metadata?.healthy;
              }
            });
          });
        }
        resolve();
      }, error => resolve())
      );
    });
  }

  onCurrentPageViewChange(type) {
    console.log(type);
    if (type === 'map') {
      console.log('here');
      if (this.devicesList.length === 0) {
        this.mapFitBounds = false;
        const center = this.commonService.averageGeolocation(this.devicesList);
        this.centerLatitude = center?.latitude || 23.0225;
        this.centerLongitude = center?.longitude || 72.5714;
        // this.zoom = 8;
      } else {
        this.mapFitBounds = true;
        // this.zoom = undefined;
      }
    }
    this.currentPageView = type;
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach((item) => {
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = {};
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: this.tileData['IOT Assets'],
      tab_name: this.tileData['IOT Assets Tab Name'],
      table_key: this.tileData['IOT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      visibility: this.tileData['Legacy Assets'],
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      visibility: this.tileData['IOT Gateways'],
      tab_name: this.tileData['IOT Gateways Tab Name'],
      table_key: this.tileData['IOT Gateways Table Key Name'],
    };
    this.currentLimit = Number(this.tileData[2]?.value) || 20;
  }

  async openDeviceEditModal(device) {
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.getGatewayList();
    }
    await this.getDeviceData(device.device_id);
    this.isOpenDeviceCreateModal = true;
  }

  onEditDeviceCancelModal() {
    this.isOpenDeviceCreateModal = false;
    this.selectedDeviceForEdit = undefined;
  }

  getDeviceData(deviceId) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        device_id: deviceId,
      };
      const methodToCall = this.deviceService.getDeviceDetailById(
        obj.app,
        obj.device_id
      );
      this.subscriptions.push(
        methodToCall.subscribe((response: any) => {
          this.selectedDeviceForEdit = response;
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
    };
    this.subscriptions.push(
      this.deviceService.getDeviceList(obj).subscribe((response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
          this.devicesList.forEach((item) => {
            const name = this.gateways.filter(
              (gateway) => gateway.device_id === item.gateway_id
            )[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      })
    );
  }

  redirectToGatewayPanel(device) {
    if (device.gateway_id) {
      this.router.navigate([
        'applications',
        this.contextApp.app,
        'devices',
        device.gateway_id,
        'control-panel',
      ]);
    } else {
      this.toasterService.showError(
        'Gateway Id is not available in selected Asset',
        'Redirection to Gateway Panel'
      );
      return;
    }
  }

  loadMoreDevices() {
    this.currentOffset += this.currentLimit;
    this.searchDevices(false);
    this.insideScrollFunFlag = true;
  }

  searchDevices(updateFilterObj = true) {
    this.tableConfig.is_table_data_loading = true;
    this.isDeviceListLoading = true;
    this.isFilterSelected = true;
    const obj = JSON.parse(JSON.stringify(this.deviceFilterObj));
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    if (this.contextApp) {
      this.hierarchyString = this.contextApp.app;
      this.displayHierarchyString = this.contextApp.app;
      obj.hierarchy = { App: this.contextApp.app };
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] =
          this.configureHierarchy[key];
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
        }
      });
      obj.hierarchy = JSON.stringify(obj.hierarchy);
    }

    if (updateFilterObj) {
      const pagefilterObj = {
        hierarchy: JSON.parse(obj.hierarchy),
        devices: undefined,
        from_date: undefined,
        to_date: undefined,
      };
      this.commonService.setItemInLocalStorage(
        CONSTANTS.MAIN_MENU_FILTERS,
        pagefilterObj
      );
    }
    delete obj.gatewayArr;
    delete obj.hierarchyString;
    if (obj.status && obj.status.toLowerCase().includes('connected')) {
      obj.connection_state = obj.status;
      delete obj.status;
    }
    const methodToCall =
      this.componentState === CONSTANTS.NON_IP_DEVICE
        ? this.deviceService.getNonIPDeviceList(obj)
        : this.deviceService.getDeviceList(obj);
    this.deviceListAPISubscription =
      methodToCall.subscribe(
        (response: any) => {
          if (response.data) {
            response.data.forEach((item) => {
              if (!item.display_name) {
                item.display_name = item.device_id;
              }
              item.device_manager_users = item.device_manager.split(',');
              if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
                const name = this.gateways.filter(
                  (gateway) => gateway.device_id === item.gateway_id
                )[0]?.display_name;
                item.gateway_display_name = name ? name : item.gateway_id;
              }
              if (this.environmentApp === 'KCMS') {
                item.mttr = '7 Mins';
                item.mtbf = '2 days 5 hours';
                item.gas = '0.4%';
                item.power = '45 SCMH';
              }
              if (this.contextApp.app === 'CMS_Dev') {
              this.derivedKPILatestData.forEach(kpiObj => {
                if (item.device_id === kpiObj.device_id) {
                  item.kpiValue = kpiObj?.metadata?.healthy;
                }
              });
              if (
                this.componentState === this.constantData.IP_DEVICE &&
                item?.connection_state?.toLowerCase() === 'connected'
              ) {
                item.icon = {
                  url: './assets/img/iot-assets-green.svg',
                  scaledSize: {
                    width: 35,
                    height: 35,
                  },
                };
              } else if (
                this.componentState === this.constantData.IP_DEVICE &&
                item?.connection_state?.toLowerCase() === 'disconnected'
              ) {
                item.icon = {
                  url: './assets/img/iot-assets-red.svg',
                  scaledSize: {
                    width: 35,
                    height: 35,
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
                    width: 30,
                    height: 30,
                  },
                };
              } else if (
                this.componentState === this.constantData.IP_GATEWAY &&
                item?.connection_state?.toLowerCase() === 'disconnected'
              ) {
                item.icon = {
                  url: './assets/img/iot-gateways-red.svg',
                  scaledSize: {
                    width: 30,
                    height: 30,
                  },
                };
              } else if (this.componentState === this.constantData.NON_IP_DEVICE) {
                item.icon = {
                  url: item.kpiValue === true ? './assets/img/legacy-asset-green.svg' : (item.kpiValue === false ? './assets/img/legacy-asset-red.svg' : './assets/img/legacy-assets.svg'),
                  scaledSize: {
                    width: 25,
                    height: 25
                  }};
              }
             } else {
                if (
                  this.componentState === this.constantData.IP_DEVICE &&
                  item?.connection_state?.toLowerCase() === 'connected'
                ) {
                  item.icon = {
                    url: './assets/img/iot-assets-green.svg',
                    scaledSize: {
                      width: 35,
                      height: 35,
                    },
                  };
                } else if (
                  this.componentState === this.constantData.IP_DEVICE &&
                  item?.connection_state?.toLowerCase() === 'disconnected'
                ) {
                  item.icon = {
                    url: './assets/img/iot-assets-red.svg',
                    scaledSize: {
                      width: 35,
                      height: 35,
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
                      width: 30,
                      height: 30,
                    },
                  };
                } else if (
                  this.componentState === this.constantData.IP_GATEWAY &&
                  item?.connection_state?.toLowerCase() === 'disconnected'
                ) {
                  item.icon = {
                    url: './assets/img/iot-gateways-red.svg',
                    scaledSize: {
                      width: 30,
                      height: 30,
                    },
                  };
                } else if (
                  this.componentState === this.constantData.NON_IP_DEVICE
                ) {
                  item.icon = {
                    url: './assets/img/legacy-assets.svg',
                    scaledSize: {
                      width: 25,
                      height: 25,
                    },
                  };
                }
              }
              if (item.hierarchy) {
                item.hierarchyString = '';
                const keys = Object.keys(item.hierarchy);
                this.contextApp.hierarchy.levels.forEach((key, index) => {
                  item.hierarchyString += item.hierarchy[key]
                    ? item.hierarchy[key] + (keys[index + 1] ? ' / ' : '')
                    : '';
                });
              }
              console.log(item.device_id , '=====', item.icon);
            });
            this.devicesList = [...this.devicesList, ...response.data];
            if (this.devicesList.length === 0) {
              this.mapFitBounds = false;
              const center = this.commonService.averageGeolocation(this.devicesList);
              this.centerLatitude = center?.latitude || 23.0225;
              this.centerLongitude = center?.longitude || 72.5714;
              // this.zoom = 8;
            } else {
              this.mapFitBounds = true;
              // this.zoom = undefined;
            }

          }
          if (response.data.length === this.currentLimit) {
            this.insideScrollFunFlag = false;
          } else {
            this.insideScrollFunFlag = true;
          }
          this.tableConfig.is_table_data_loading = false;
          this.isDeviceListLoading = false;
        },
        (error) => {
          this.isDeviceListLoading = false;
          this.tableConfig.is_table_data_loading = false;
          this.insideScrollFunFlag = false;
        }
      );
  }

  clearFilter() {
    this.currentOffset = 0;
    // this.devicesList = [];
    this.deviceFilterObj = undefined;
    this.deviceFilterObj = JSON.parse(
      JSON.stringify(this.originalDeviceFilterObj)
    );
    this.hierarchyArr = [];
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.gateways = JSON.parse(JSON.stringify(this.originalGateways));
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index);
        }
      }
    });
  }

  onTableFunctionCall(obj) {
    if (obj.for === 'View Control Panel') {
    this.router.navigate([
      'applications',
      this.contextApp.app,
      'devices',
      obj.data.device_id,
      'control-panel',
    ]);
    } else if (obj.for === 'View Gateway Panel') {
      this.redirectToGatewayPanel(obj.data);
    } else if (obj.for === 'Edit') {
      this.openDeviceEditModal(obj.data);
    } else if (obj.for === 'View Device Status') {
      this.getDerivedKPIsHistoricData(obj.data);
      $('#derivedKPIModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  redirectToDevice(device) {
    this.router.navigate(['applications', this.contextApp.app,
    'devices',
    device.device_id, 'control-panel']);
  }

  getDerivedKPIsHistoricData(device) {
    this.isDerivedKPIDataLoading = true;
    this.loader = true;
    const kpiCode = 'SPCD';
    const obj = {
      device_id: device.device_id,
      from_date: moment().subtract(14, 'days').utc().unix(),
      to_date: moment().utc().unix(),
      epoch: true,
      asset_model: device.device_type
    };
    this.derivedKPIData = [];
    this.subscriptions.push(this.deviceService.getDerivedKPIHistoricalData(this.contextApp.app, kpiCode, obj)
    .subscribe((response: any) => {
      if (response?.data) {
        // this.derivedKPIData = response.data;
        this.derivedKPIData = response.data.filter(item => item.metadata.specific_power_consumption_discharge !== undefined
          && item.metadata.specific_power_consumption_discharge !== null);
        console.log(this.derivedKPIData.length);
        // this.derivedKPILatestData.reverse();
        this.isDerivedKPIDataLoading = false;
        if (this.derivedKPIData.length > 0) {
          setTimeout(() => this.plotChart(), 500);
        } else {
          this.isDerivedKPIDataLoading = false;
          this.loader = false;
        }
      }
    }, error => {
      this.isDerivedKPIDataLoading = false;
      this.loader = false;
    })
    );
  }

  plotChart() {
    this.loadingMessage = 'Loading Chart. Please wait...';
    am4core.options.autoDispose = true;
    const chart = am4core.create('derivedKPIChart', am4charts.XYChart);
    const data = [];
    this.derivedKPIData.reverse();
    console.log(this.derivedKPIData);
    this.derivedKPIData.forEach((obj, i) => {
      const newObj: any = {};
      const date = this.commonService.convertUTCDateToLocal(obj?.metadata.process_start_interval);
      const endDate = this.commonService.convertUTCDateToLocal(obj?.metadata.process_end_interval);
      newObj.date = new Date(date);
      newObj.endDate = new Date(endDate);
      newObj.spc = obj.metadata?.specific_power_consumption_discharge || null;
      console.log(newObj);
      data.splice(data.length, 0, newObj);
    });
    console.log(data);
    chart.data = data;
    chart.dateFormatter.inputDateFormat = 'x';
    chart.dateFormatter.dateFormat = 'dd-MMM-yyyy';
    const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { count: 1, timeUnit: 'day' };
    dateAxis.strictMinMax = true;
    dateAxis.renderer.tooltipLocation = 0;
    // Add data
    // Set input format for the dates
    // chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';

    // Create axes
    const valueYAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueYAxis.renderer.grid.template.location = 0;
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name =  'Specific Power Consumption';
    series.yAxis = valueYAxis;
    series.dataFields.openDateX = 'date';
    series.dataFields.dateX = 'endDate';
    series.dataFields.valueY =  'spc';
    series.strokeWidth = 2;
    series.strokeOpacity = 1;
    series.legendSettings.labelText = '{name}';
    // series.fillOpacity = 0;
    series.columns.template.tooltipText = 'Start Date: {openDateX} \n End Date: {dateX} \n {name}: [bold]{spc} [/]';

    // const bullet = series.bullets.push(new am4charts.CircleBullet());
    // bullet.strokeWidth = 2;
    // bullet.circle.radius = 1.5;
    valueYAxis.tooltip.disabled = true;
    valueYAxis.renderer.labels.template.fill = am4core.color('gray');
    // valueYAxis.renderer.minWidth = 35;

    chart.legend = new am4charts.Legend();
    chart.logo.disabled = true;
    chart.legend.maxHeight = 80;
    chart.legend.scrollable = true;
    chart.legend.labels.template.maxWidth = 30;
    chart.legend.labels.template.truncate = true;
   //  chart.cursor = new am4charts.XYCursor();
    chart.legend.itemContainers.template.togglable = false;
    dateAxis.dateFormatter = new am4core.DateFormatter();
    chart.events.on('ready', (ev) => {
      this.loader = false;
      this.loadingMessage = 'Loading Data. Wait...';
    });
    // chart.scrollbarX = new am4core.Scrollbar();
    // chart.scrollbarX.parent = chart.bottomAxesContainer;
    // dateAxis.dateFormatter.dateFormat = 'W';
    this.chart = chart;
  }

  onCloseModal() {
    $('#derivedKPIModal').modal('hide');
    this.isDerivedKPIDataLoading = false;
    this.loader = false;
    this.loadingMessage = 'Loading Data. Please wait...';
    this.derivedKPIData = [];
  }

  onAssetSelection() {
    if (this.deviceFilterObj?.gatewayArr.length > 0) {
      this.deviceFilterObj.gateway_id =
        this.deviceFilterObj.gatewayArr[0].device_id;
    } else {
      this.deviceFilterObj.gateway_id = undefined;
      this.deviceFilterObj.gatewayArr = undefined;
    }
  }

  onAssetDeselect() {
    this.deviceFilterObj.gateway_id = undefined;
    this.deviceFilterObj.gatewayArr = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.deviceListAPISubscription?.unsubscribe();
  }
}
