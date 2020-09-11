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
  nonIPDeviceCategory: any;
  constantData = CONSTANTS;
  originalSingularComponentState: string;
  gateways: any[];
  tableConfig: any;
  pageType: string;
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
      this.appName = params.get('applicationId');

      this.deviceFilterObj.app = this.appName;
    });


    this.route.queryParamMap.subscribe(
      params => {
        if (params.get('connection_state')) {
          this.deviceFilterObj.connection_state = params.get('connection_state');
          this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
          this.searchDevices();
        }
        if (params.get('state')) {
          this.componentState = params.get('state');
          if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
            this.nonIPDeviceCategory = CONSTANTS.NON_IP_DEVICE_OPTIONS.filter(item => item.name === params.get('category'))[0];
            this.getGatewayList();
          } else {
            this.nonIPDeviceCategory = undefined;
          }
        } else {
          this.componentState = CONSTANTS.IP_DEVICE;
          this.nonIPDeviceCategory = undefined;
        }
        if (this.componentState === CONSTANTS.IP_GATEWAY) {
          this.pageType = 'Gateway';
        } else {
          this.pageType = 'Device';
        }
        this.commonService.breadcrumbEvent.emit({
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
                  (this.componentState === CONSTANTS.NON_IP_DEVICE ?  this.nonIPDeviceCategory.name : ''))),
                url: 'applications/' + this.appName + '/' + this.pageType + 's',
                queryParams: {
                    state: this.componentState,
                    category: this.nonIPDeviceCategory?.name,
                    connection_state: this.deviceFilterObj.connection_state ? this.deviceFilterObj.connection_state : undefined
                }
              }
          ]
        });
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
              name: 'Connectivity',
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
                  icon: 'fas fa-fw fa-eye',
                  text: '',
                  id: 'View Devices',
                  valueclass: 'mr-2',
                  tooltip: 'View Devices',
                },
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
        if (this.componentState !== this.constantData.IP_GATEWAY) {
          this.tableConfig.data[4].btnData.splice(0, 1);
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
    if (this.nonIPDeviceCategory) {
      this.deviceFilterObj.category = this.nonIPDeviceCategory.name;
    }
    const methodToCall = this.nonIPDeviceCategory
    ? this.deviceService.getNonIPDeviceList(this.deviceFilterObj)
    : this.deviceService.getDeviceList(this.deviceFilterObj);
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
    this.deviceDetail.tags = {
      protocol: (this.nonIPDeviceCategory ? this.nonIPDeviceCategory.protocol : undefined)
    };
    if (this.nonIPDeviceCategory) {
      this.getConnectivityData();
    }
    this.deviceDetail.tags.app = this.appName;
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCreateDevice() {
    console.log(this.deviceDetail);
    if (!this.deviceDetail.device_id || !this.deviceDetail.tags.device_manager || !this.deviceDetail.tags.protocol
      || !this.deviceDetail.tags.cloud_connectivity  || !this.deviceDetail.tags.manufacturer ) {
        this.toasterService.showError('Please fill all the details',
        'Create ' + (this.nonIPDeviceCategory ? this.nonIPDeviceCategory.name : this.pageType));
        return;
    }
    this.isCreateDeviceAPILoading = true;
    console.log(this.deviceDetail);
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.app = this.nonIPDeviceCategory ? this.appName : undefined;
    this.deviceDetail.tags.category = this.nonIPDeviceCategory ? this.nonIPDeviceCategory.name : this.componentState;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const methodToCall = this.nonIPDeviceCategory
    ? this.deviceService.createNonIPDevice(this.deviceDetail, this.appName)
    : this.deviceService.createDevice(this.deviceDetail, this.appName);
    methodToCall.subscribe(
      (response: any) => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + (this.nonIPDeviceCategory ? this.nonIPDeviceCategory.name : this.pageType));
        this.onCloseCreateDeviceModal();
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + (this.nonIPDeviceCategory ? this.nonIPDeviceCategory.name : this.pageType));
        // this.onCloseCreateDeviceModal();
      }
    );
  }

  onTableFunctionCall(obj) {
    console.log(obj);
    console.log(this.pageType);
    if (obj.type === this.pageType.toLowerCase()) {
      if (obj.for === 'View Devices') {
      } else if (obj.for === 'View Control Panel') {
        console.log('ghereee', ['applications', this.appName,
        (this.pageType.toLowerCase() + 's') ,
        obj.data.device_id, 'control-panel']);
        this.router.navigate(['applications', this.appName,
        (this.pageType.toLowerCase() + 's') ,
        obj.data.device_id, 'control-panel']);
      }
    }
  }

  onCloseCreateDeviceModal() {
    $('#createDeviceModal').modal('hide');
    this.deviceDetail = undefined;
  }
}
