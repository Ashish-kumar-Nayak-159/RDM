import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { Component, OnInit } from '@angular/core';
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
export class DeviceListComponent implements OnInit {

  deviceFilterObj: DeviceListFilter = new DeviceListFilter();
  originalDeviceFilterObj: DeviceListFilter = new DeviceListFilter();
  devicesList: Device[] = [];
  isDeviceListLoading = false;
  userData: any;
  isFilterSelected = false;
  deviceDetail: any;
  isCreateDeviceAPILoading = false;
  protocolList: any[] = [];
  connectivityList: any[] = [];
  appName: string;
  componentState: string; // value must be IP Devices & Gateways or IP Device or IP Gateway or Non IP Devices
  constantData = CONSTANTS;
  originalSingularComponentState: string;
  gateways: any[];
  tableConfig: any;
  pageType: string;
  deviceCategory = CONSTANTS.NON_IP_DEVICE_OPTIONS;
  gatewayId: string;
  contextApp: any;
  hierarchyDropdown: any[] = [];
  deviceTypes: any[] = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.protocolList = CONSTANTS.PROTOCOL_CONNECTIVITY_LIST;
      this.devicesList = [];
      this.appName = params.get('applicationId');
      this.contextApp = this.userData.apps.filter(
        app => app.app === params.get('applicationId')
      )[0];
      console.log(this.contextApp);
      if (params.get('listName')) {
        const listName = params.get('listName');
        if (listName.toLowerCase() === 'nonipdevices') {
          this.componentState = CONSTANTS.NON_IP_DEVICE;
          this.pageType = 'Device';
          this.getGatewayList();
          this.getThingsModels(this)
        } else if (listName.toLowerCase() === 'gateways') {
          this.componentState = CONSTANTS.IP_GATEWAY;
          this.pageType = 'Gateway';
        } else if (listName.toLowerCase() === 'devices') {
          this.componentState = CONSTANTS.IP_DEVICE;
          this.pageType = 'Device';
        }
      }
      this.getThingsModels(this.componentState);
      this.deviceFilterObj.app = this.appName;
      this.deviceFilterObj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
      this.deviceFilterObj.hierarchyString =  this.contextApp.user.hierarchyString;
      const keys = Object.keys(this.contextApp.user.hierarchy);
      this.hierarchyDropdown = [];
      this.contextApp.hierarchy.forEach(item => {
        if (item.level >= keys.length - 1 && item.name !== 'App') {
          this.hierarchyDropdown.push(item);
        }
      });
      const obj = {
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.appName
          },
            {
              title:
                (this.componentState === CONSTANTS.IP_GATEWAY ? 'Gateways' :
                (this.componentState === CONSTANTS.IP_DEVICE ? 'Devices' :
                (this.componentState === CONSTANTS.NON_IP_DEVICE ?  'Non IP Devices' : ''))),
              url: 'applications/' + this.appName + '/' +
              (this.componentState === CONSTANTS.NON_IP_DEVICE ? 'nonIPDevices' : (this.pageType + 's')),
              queryParams: {
                  connection_state: this.deviceFilterObj.connection_state ? this.deviceFilterObj.connection_state : undefined
              }
            }
        ]
      };
      this.commonService.breadcrumbEvent.emit(obj);
      this.deviceFilterObj.category = this.componentState;
      if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
        this.deviceFilterObj.category = undefined;
      }
      this.tableConfig = {
        type: this.pageType.toLowerCase(),
        data: [
          {
            name: this.pageType + ' Name',
            key: 'tags.display_name',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: this.pageType + ' Manager',
            key: 'tags.device_manager',
            type: 'text',
            headerClass: 'w-10',
            valueclass: ''
          },
          {
            name: 'Connectivity',
            key: 'tags.cloud_connectivity',
            type: 'text',
            headerClass: 'w-30',
            valueclass: ''
          },
          {
            name: 'Location',
            key: 'tags.hierarchyString',
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
                icon: 'fas fa-fw fa-table',
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
          name: 'Reporting Via',
          key: 'gateway_id',
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
    this.route.queryParamMap.subscribe(

      params => {
        this.devicesList = [];
        if (params.get('connection_state')) {
          this.deviceFilterObj.status = params.get('connection_state');
          this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
        }
        this.searchDevices();
      }
    );
    console.log(this.deviceFilterObj);
  }

  getThingsModels(type) {
    this.deviceTypes = [];
    const obj = {
      app: this.contextApp.app,
      model_type: type
    };
    this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.deviceTypes = response.data;
        }
      }
    );
  }


  getGatewayList() {
    this.gateways = [];
    const obj = {
      app: this.appName,
      category: CONSTANTS.IP_GATEWAY
    };
    this.deviceService.getDeviceList(obj).subscribe(
      (response: any) => {
        if (response.data) {
          this.gateways = response.data;
        }
      }
    );
  }

  searchDevices() {
    this.isDeviceListLoading = true;
    this.isFilterSelected = true;
    const obj = JSON.parse(JSON.stringify(this.deviceFilterObj));
    delete obj.hierarchyString;
    if (obj.status && obj.status.includes('connected')) {
      obj.connection_state = obj.status;
      delete obj.status;
    }
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.getNonIPDeviceList(obj)
    : this.deviceService.getDeviceList(obj);
    methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          this.devicesList = response.data;
          this.devicesList.forEach(item => {
            if (!item.tags.display_name) {
              item.tags.display_name = item.device_id;
            }
            if (item.tags.hierarchy_json) {
              item.tags.hierarchyString = '';
              const keys = Object.keys(item.tags.hierarchy_json);
              keys.forEach((key, index) => {
                item.tags.hierarchyString += item.tags.hierarchy_json[key] + ( keys[index + 1] ? ' / ' : '');
              });
            }
          });
        }
        this.isDeviceListLoading = false;
      }, error => {
        this.isDeviceListLoading = false;
    });
  }

  clearFilter() {
    this.deviceFilterObj = undefined;
    this.deviceFilterObj = JSON.parse(JSON.stringify(this.originalDeviceFilterObj));
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
    this.deviceDetail.tags.app = this.appName;
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
      || !this.deviceDetail.tags.cloud_connectivity  || !this.deviceDetail.tags.manufacturer ) {
        this.toasterService.showError('Please fill all the details',
        'Create ' + this.pageType);
        return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && (!this.deviceDetail.gateway_id || !this.deviceDetail.tags.category)) {
      this.toasterService.showError('Please fill all the details',
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
    this.deviceDetail.tags.hierarchy = JSON.stringify(this.deviceDetail.tags.hierarchy_json );
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.app = this.appName;
    this.deviceDetail.tags.category = this.componentState === CONSTANTS.NON_IP_DEVICE ?
    this.deviceDetail.tags.category : this.componentState;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.createNonIPDevice(this.deviceDetail, this.appName)
    : this.deviceService.createDevice(this.deviceDetail, this.appName);
    methodToCall.subscribe(
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
    );
  }

  onTableFunctionCall(obj) {
    console.log(obj);
    console.log(this.pageType);
    if (obj.type === this.pageType.toLowerCase()) {
        if (this.gatewayId) {
          this.router.navigate(['applications', this.appName,
          'nonIPDevices',
          obj.data.device_id, 'control-panel']);
        } else {
          if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
            this.router.navigate(['applications', this.appName,
          'nonIPDevices',
          obj.data.device_id, 'control-panel']);
          } else {
          this.router.navigate(['applications', this.appName,
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
}
