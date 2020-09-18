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
  protocolList = CONSTANTS.PROTOCOL_CONNECTIVITY_LIST;
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
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.devicesList = [];
      this.appName = params.get('applicationId');
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
      this.deviceFilterObj.app = this.appName;
      const obj = {
        type: 'replace',
        data: [
          {
            title: this.appName,
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
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Connectivity',
            key: 'tags.cloud_connectivity',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Location',
            key: 'tags.location',
            type: 'text',
            headerClass: '',
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
      this.protocolList = JSON.parse(JSON.stringify(data));
      console.log(JSON.stringify(this.protocolList));
    });
    this.route.queryParamMap.subscribe(

      params => {
        this.devicesList = [];
        if (params.get('connection_state')) {
          this.deviceFilterObj.status = params.get('connection_state');
          this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
          this.searchDevices();
        }
      }
    );
    console.log(this.deviceFilterObj);
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
    console.log(this.deviceDetail);
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
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
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.app = this.appName;
    this.deviceDetail.tags.category = this.componentState === CONSTANTS.NON_IP_DEVICE ? this.deviceDetail.tags.category : this.componentState;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.createNonIPDevice(this.deviceDetail, this.appName)
    : this.deviceService.createDevice(this.deviceDetail, this.appName);
    methodToCall.subscribe(
      (response: any) => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + this.pageType);
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
