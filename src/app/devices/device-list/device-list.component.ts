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
declare var $: any;
@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
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
  pageType: string;
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) {
  }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

  //  this.commonService.setFlag(true);
    this.subscriptions.push(this.route.paramMap.subscribe(async params => {
      this.currentOffset = 0;
      this.currentLimit = 20;
      this.insideScrollFunFlag = false;
      this.isFilterSelected = false;
      this.currentPageView = 'list';
      this.deviceFilterObj = new DeviceListFilter();
      this.deviceFilterObj.app = this.contextApp.app;
      this.deviceFilterObj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
      this.deviceFilterObj.hierarchyString =  this.contextApp.user.hierarchyString;
      this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
      const filterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
      if (filterObj?.gateway_id) {
        this.deviceFilterObj.gateway_id = filterObj.gateway_id;
        localStorage.removeItem(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
      }
      this.devicesList = [];
      if (params.get('listName')) {
        const listName = params.get('listName');

        if (listName.toLowerCase() === 'nonipdevices') {
          this.componentState = CONSTANTS.NON_IP_DEVICE;
          this.pageType = 'Device';
          this.getGatewayList();
        } else if (listName.toLowerCase() === 'gateways') {
          this.componentState = CONSTANTS.IP_GATEWAY;
          this.pageType = 'Gateway';
        } else if (listName.toLowerCase() === 'devices') {
          this.componentState = CONSTANTS.IP_DEVICE;
          this.pageType = 'Device';
        }
      }
      await this.getTileName();
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index);
        }
        }
      });
      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title:
              this.tileData && this.tileData[0] ? this.tileData[0]?.value : '',
              url: 'applications/' + this.contextApp.app + '/' +
              (this.componentState === CONSTANTS.NON_IP_DEVICE ? 'nonIPDevices' : (this.pageType + 's')),
              queryParams: {
                  connection_state: this.deviceFilterObj.connection_state ? this.deviceFilterObj.connection_state : undefined
              }
            }
        ]
      };
      this.commonService.breadcrumbEvent.emit(obj);
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.deviceFilterObj.type = undefined;
      } else {
        this.deviceFilterObj.type = this.componentState;
      }

      this.subscriptions.push(this.route.queryParamMap.subscribe(
        params1 => {
          this.devicesList = [];
          if (params1.get('connection_state')) {
            this.deviceFilterObj.status = params1.get('connection_state');
          }
          if (params1.keys.length > 0) {
            this.searchDevices();
          }
        }
      ));
      if (!this.isFilterSelected) {
        this.searchDevices();
      }
      this.protocolList = CONSTANTS.PROTOCOLS;

      const keys = Object.keys(this.contextApp.user.hierarchy);
      this.hierarchyDropdown = [];
      // this.contextApp.hierarchy.forEach(item => {
      //   if (item.level >= keys.length - 1 && item.name !== 'App') {
      //     this.hierarchyDropdown.push(item);
      //   }
      // });

      this.tableConfig = {
        type: this.pageType.toLowerCase(),
        data: [
          {
            name: (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Name',
            key: 'display_name',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: (this.tileData && this.tileData[1] ? this.tileData[1]?.value : '') + ' Manager',
            key: 'device_manager',
            type: 'text',
            headerClass: 'w-30',
            valueclass: ''
          },
          {
            name: 'Hierarchy',
            key: 'hierarchyString',
            type: 'text',
            headerClass: 'w-30',
            valueclass: ''
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            headerClass: '',
            btnData: [
              {
                icon: 'fa fa-fw fa-table',
                text: '',
                id: 'View Control Panel',
                valueclass: '',
                tooltip: 'View Control panel'
              }
            ]
          }
        ]
      };
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.tableConfig.data.splice((this.tableConfig.data.length - 2), 0, {
          name: 'Reporting Via GW',
          key: 'gateway_display_name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        });
      }


    }));
    setTimeout(() => {
    $('#table-wrapper').on('scroll', () => {
      const element = document.getElementById('table-wrapper');
      if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0))
      >= parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
        this.currentOffset += this.currentLimit;
        this.searchDevices();
        this.insideScrollFunFlag = true;
      }
    });
  }, 2000);
  }

  onChangeOfHierarchy(i) {
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
    const hierarchyObj: any = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (Object.keys(hierarchyObj).length === 1) {
      this.gateways = JSON.parse(JSON.stringify(this.originalGateways));
    } else {
    const arr = [];
    this.gateways = [];
    this.originalGateways.forEach(device => {
      let flag = false;
      Object.keys(hierarchyObj).forEach(hierarchyKey => {
        if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
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


  onCurrentPageViewChange(type) {
    console.log(type);
    if (type === 'map') {
      console.log('here');
      const center = this.commonService.averageGeolocation(this.devicesList);
      console.log(center);
      this.centerLatitude = (center?.latitude) || 23.0225;
      this.centerLongitude = (center?.longitude) || 72.5714;
      console.log(this.centerLatitude);
      console.log(this.centerLongitude);
    }
    this.currentPageView = type;
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if ((item.page === this.iotDevicesPage && this.componentState === CONSTANTS.IP_DEVICE) ||
      (item.page === this.legacyDevicesPage && this.componentState === CONSTANTS.NON_IP_DEVICE) ||
      (item.page === this.iotGatewaysPage && this.componentState === CONSTANTS.IP_GATEWAY)) {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    this.currentLimit = Number(this.tileData[2]?.value) || 20;
  }




  getGatewayList() {
    this.gateways = [];
    this.originalGateways = [];
    const obj = {
      app: this.contextApp.app,
      type: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
    };
    this.subscriptions.push(this.deviceService.getDeviceList(obj).subscribe(
      (response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
          this.devicesList.forEach(item => {
            const name = this.gateways.filter(gateway => gateway.device_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      }
    ));
  }

  redirectToGatewayPanel(device) {
    if (device.gateway_id) {
      this.router.navigate(['applications', this.contextApp.app, 'gateways', device.gateway_id, 'control-panel']);
    } else {
      this.toasterService.showError('Gateway Id is not available in selected Asset', 'Redirection to Gateway Panel');
      return;
    }
  }

  searchDevices() {
    this.isDeviceListLoading = true;
    this.isFilterSelected = true;
    const obj = JSON.parse(JSON.stringify(this.deviceFilterObj));
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    if (this.contextApp) {
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    }
    delete obj.gatewayArr;
    delete obj.hierarchyString;
    if (obj.status && obj.status.toLowerCase().includes('connected')) {
      obj.connection_state = obj.status;
      delete obj.status;
    }
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.getNonIPDeviceList(obj)
    : this.deviceService.getDeviceList(obj);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          response.data.forEach(item => {
            if (!item.display_name) {
              item.display_name = item.device_id;
            }
            item.device_manager_users = item.device_manager.split(',');
            if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
            const name = this.gateways.filter(gateway => gateway.device_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
            }
            console.log(this.componentState);
            if (this.componentState === this.constantData.IP_DEVICE &&
              item?.connection_state?.toLowerCase() === 'connected') {
              item.icon = {
                url: './assets/img/iot-assets-green.svg',
                scaledSize: {
                  width: 35,
                  height: 35
                }};
            } else if (this.componentState === this.constantData.IP_DEVICE && item?.connection_state?.toLowerCase() === 'disconnected') {
              item.icon = {
                url: './assets/img/iot-assets-red.svg',
                scaledSize: {
                  width: 35,
                  height: 35
                }};
            } else if (this.componentState === this.constantData.IP_GATEWAY && item?.connection_state?.toLowerCase() === 'connected') {
              item.icon = {
                url: './assets/img/iot-gateways-green.svg',
                scaledSize: {
                  width: 30,
                  height: 30
                }};
            } else if (this.componentState === this.constantData.IP_GATEWAY &&
              item?.connection_state?.toLowerCase() === 'disconnected') {
              item.icon = {
                url: './assets/img/iot-gateways-red.svg',
                scaledSize: {
                  width: 30,
                  height: 30
                }};
            } else if (this.componentState === this.constantData.NON_IP_DEVICE) {
              item.icon = {
                url: './assets/img/legacy-assets.svg',
                scaledSize: {
                  width: 25,
                  height: 25
                }};
            }
            console.log(item.icon);
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] ? (item.hierarchy[key] + ( keys[index + 1] ? ' / ' : '')) : '';
              });
            }
          });
          this.devicesList = [...this.devicesList, ...response.data];
        }
        if (response.data.length === this.currentLimit) {
        this.insideScrollFunFlag = false;
        } else {
          this.insideScrollFunFlag = true;
        }

        this.isDeviceListLoading = false;
      }, error => {
        this.isDeviceListLoading = false;
        this.insideScrollFunFlag = false;
    }));
  }

  clearFilter() {
    this.currentOffset = 0;
    // this.devicesList = [];
    this.deviceFilterObj = undefined;
    this.deviceFilterObj = JSON.parse(JSON.stringify(this.originalDeviceFilterObj));
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
    if (this.gatewayId) {
      this.router.navigate(['applications', this.contextApp.app,
      'nonIPDevices',
      obj.device_id, 'control-panel']);
    } else {
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.router.navigate(['applications', this.contextApp.app,
      'nonIPDevices',
      obj.device_id, 'control-panel']);
      } else {
        this.router.navigate(['applications', this.contextApp.app,
        (this.pageType.toLowerCase() + 's') ,
        obj.device_id, 'control-panel']);
      }
    }
  }

  onAssetSelection() {
    if (this.deviceFilterObj?.gatewayArr.length > 0) {
      this.deviceFilterObj.gateway_id = this.deviceFilterObj.gatewayArr[0].device_id;
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
