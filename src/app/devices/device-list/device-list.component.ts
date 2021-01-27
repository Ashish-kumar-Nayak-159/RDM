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
  addDeviceHierarchyArr = {};
  addDeviceConfigureHierarchy = {};
  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

  //  this.commonService.setFlag(true);
    this.route.paramMap.subscribe(async params => {
      this.deviceFilterObj = new DeviceListFilter();
      this.deviceFilterObj.app = this.contextApp.app;
      this.deviceFilterObj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
      this.deviceFilterObj.hierarchyString =  this.contextApp.user.hierarchyString;
      this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
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
        this.addDeviceHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        this.addDeviceConfigureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index);
          this.onChangeOfAddDeviceHierarchy(index);

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
        this.deviceFilterObj.category = undefined;
      } else {
        this.deviceFilterObj.category = this.componentState;
      }

      this.route.queryParamMap.subscribe(
        params1 => {
          this.devicesList = [];
          if (params1.get('connection_state')) {
            this.deviceFilterObj.status = params1.get('connection_state');

          }
          this.searchDevices();
        }
      );
      this.protocolList = CONSTANTS.PROTOCOL_CONNECTIVITY_LIST;
      console.log(this.contextApp);
      this.getThingsModels(this.componentState);
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
      const data = JSON.parse(JSON.stringify(this.protocolList));
      data.forEach(protocol => {
        if (this.componentState === CONSTANTS.IP_DEVICE || this.componentState === CONSTANTS.IP_GATEWAY) {
          if (!protocol.name.includes('IP')) {
            protocol.display = false;
          }
          if (this.componentState === CONSTANTS.IP_GATEWAY && protocol.name.includes('IP')) {
            protocol.name = protocol.name.replace('Device', 'Gateway');
            const list = [];
            protocol.connectivity.forEach(item => {
              list.push(item.replace('Device', 'Gateway'));
            });
            protocol.connectivity = JSON.parse(JSON.stringify(list));
          }
        } else {
          if (protocol.name.includes('IP')) {
            protocol.display = false;
          }
        }
      });
      console.log(JSON.stringify(data));
      this.protocolList = JSON.parse(JSON.stringify(data));


    });
    console.log(this.deviceFilterObj);
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
        console.log(device.hierarchy[hierarchyKey] , '&&', device.hierarchy[hierarchyKey], '===', hierarchyObj[hierarchyKey])
        if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
          flag = true;
        } else {
          flag = false;
        }
      });
      console.log(flag);
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
        this.addDeviceHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
  }

  onChangeOfAddDeviceHierarchy(i) {
    Object.keys(this.addDeviceConfigureHierarchy).forEach(key => {
      if (key > i) {
        delete this.addDeviceConfigureHierarchy[key];
      }
    });
    Object.keys(this.addDeviceHierarchyArr).forEach(key => {
      if (key > i) {
        this.addDeviceHierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.addDeviceConfigureHierarchy).forEach((key, index) => {
      if (this.addDeviceConfigureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.addDeviceConfigureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.addDeviceHierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      console.log(item.system_name, '------', this.componentState);
      if (item.system_name === this.componentState + 's') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem;
  }

  getThingsModels(type) {
    console.log('207      ', type);
    this.deviceTypes = [];
    const obj = {
      app: this.contextApp.app,
      model_type: type
    };
    console.log(obj);
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.deviceTypes = response.data;
        }
      }
    ));
  }


  getGatewayList() {
    this.gateways = [];
    this.originalGateways = [];
    const obj = {
      app: this.contextApp.app,
      category: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
    };
    this.subscriptions.push(this.deviceService.getDeviceList(obj).subscribe(
      (response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
        }
      }
    ));
  }

  searchDevices() {
    this.isDeviceListLoading = true;
    this.isFilterSelected = true;
    const obj = JSON.parse(JSON.stringify(this.deviceFilterObj));
    if (this.contextApp) {
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(obj.hierarchy);
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    console.log(obj.hierarchy);
    }
    delete obj.hierarchyString;
    if (obj.status && obj.status.includes('connected')) {
      obj.connection_state = obj.status;
      delete obj.status;
    }
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.getNonIPDeviceList(obj)
    : this.deviceService.getDeviceList(obj);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          this.devicesList = response.data;
          console.log(this.devicesList);
          this.devicesList.forEach(item => {
            if (!item.display_name) {
              item.display_name = item.device_id;
            }
            if (this.gateways?.length > 0) {
              item.gateway_display_name = this.gateways.filter(gateway => gateway.device_id === item.gateway_id)[0]?.display_name;
            }
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              keys.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
              });
            }
          });
        }
        this.isDeviceListLoading = false;
      }, error => {
        this.isDeviceListLoading = false;
    }));
  }

  clearFilter() {
    this.deviceFilterObj = undefined;
    this.deviceFilterObj = JSON.parse(JSON.stringify(this.originalDeviceFilterObj));
    console.log(this.deviceFilterObj);
    this.hierarchyArr = [];
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      this.addDeviceHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.gateways = JSON.parse(JSON.stringify(this.originalGateways));
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
      this.addDeviceConfigureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfHierarchy(index);
        this.onChangeOfAddDeviceHierarchy(index);

      }
      }
    });
  }

  getConnectivityData() {
    this.deviceDetail.tags.cloud_connectivity = undefined;
    if (this.deviceDetail && this.deviceDetail.tags && this.deviceDetail.tags.protocol) {
      this.connectivityList = (this.protocolList.filter(protocol => protocol.name === this.deviceDetail.tags.protocol)[0]).connectivity;
    }
  }

  openCreateDeviceModal() {
    this.deviceDetail = new Device();
    this.deviceDetail.tags = {};
    this.deviceDetail.tags.app = this.contextApp.app;
    this.deviceDetail.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onChangeThingsModel() {
    if (this.deviceDetail.tags.device_type) {
      const modelObj = this.deviceTypes.filter(type => type.name === this.deviceDetail.tags.device_type)[0];
      const obj = {...this.deviceDetail.tags, ...modelObj.tags};
      this.deviceDetail.tags = obj;
    }
  }

  onCreateDevice() {
    console.log(this.deviceDetail);
    if (!this.deviceDetail.device_id || !this.deviceDetail.tags.device_manager || !this.deviceDetail.tags.protocol
      || !this.deviceDetail.tags.cloud_connectivity  ) {
        this.toasterService.showError('Please fill all the details',
        'Create ' + this.pageType);
        return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.deviceDetail.tags.device_manager)) {
      this.toasterService.showError('Email address is not valid',
        'Create ' + this.pageType);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && this.deviceDetail.device_id === this.deviceDetail.gateway_id) {
      this.toasterService.showError('Gateway and Device name can not be the same.',
      'Create ' + this.pageType);
      return;
    }
    this.isCreateDeviceAPILoading = true;
    console.log(this.deviceDetail);
    this.deviceDetail.tags.hierarchy_json = { App: this.contextApp.app};
    Object.keys(this.addDeviceConfigureHierarchy).forEach((key) => {
      this.deviceDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] = this.addDeviceConfigureHierarchy[key];
      console.log(this.deviceDetail.tags.hierarchy_json);
    });
    this.deviceDetail.tags.hierarchy = JSON.stringify(this.deviceDetail.tags.hierarchy_json );
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.app = this.contextApp.app;
    delete this.deviceDetail.tags.reserved_tags;
    this.deviceDetail.tags.category = this.componentState === CONSTANTS.NON_IP_DEVICE ?
    null : this.componentState;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.createNonIPDevice(this.deviceDetail, this.contextApp.app)
    : this.deviceService.createDevice(this.deviceDetail, this.contextApp.app);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + this.pageType);
        this.searchDevices();
        this.onCloseCreateDeviceModal();
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + this.pageType);
        // this.onCloseCreateDeviceModal();
      }
    ));
  }

  onTableFunctionCall(obj) {
    console.log(obj);
    console.log(this.pageType);
    if (obj.type === this.pageType.toLowerCase()) {
        if (this.gatewayId) {
          this.router.navigate(['applications', this.contextApp.app,
          'nonIPDevices',
          obj.data.device_id, 'control-panel']);
        } else {
          if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
            this.router.navigate(['applications', this.contextApp.app,
          'nonIPDevices',
          obj.data.device_id, 'control-panel']);
          } else {
            this.router.navigate(['applications', this.contextApp.app,
            (this.pageType.toLowerCase() + 's') ,
            obj.data.device_id, 'control-panel']);
          }
        }
    }
  }

  onCloseCreateDeviceModal() {
    $('#createDeviceModal').modal('hide');
    this.deviceDetail = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
