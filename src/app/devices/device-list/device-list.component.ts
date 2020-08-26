import { Component, OnInit } from '@angular/core';
import { DeviceListFilter, Device } from 'src/app/models/device.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService } from './../../services/devices/device.service';
import { ThrowStmt } from '@angular/compiler';
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
      this.commonService.breadcrumbEvent.emit({
        data: [
            {
              title: this.appName,
              url: 'applications/' + this.appName
            },
            {
              title: 'devices',
              url: 'applications/' + this.appName + '/devices'
            }
        ]
      });
      this.deviceFilterObj.app = this.appName;
    });

    this.route.queryParamMap.subscribe(
      params => {
        if (params.get('state')) {
          this.deviceFilterObj.connection_state = params.get('state');
          this.originalDeviceFilterObj = JSON.parse(JSON.stringify(this.deviceFilterObj));
          this.searchDevices();
        }
      }
    );
    console.log(this.deviceFilterObj);
  }

  searchDevices() {
    this.isDeviceListLoading = true;
    this.isFilterSelected = true;
    this.deviceService.getDeviceList(this.deviceFilterObj).subscribe(
      (response: any) => {
        if (response.data) {
          this.devicesList = response.data;
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
    };
    this.deviceDetail.tags.app = this.appName;
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCreateDevice() {
    console.log(this.deviceDetail);
    if (!this.deviceDetail.device_id || !this.deviceDetail.tags.device_manager || !this.deviceDetail.tags.protocol
      || !this.deviceDetail.tags.cloud_connectivity  || !this.deviceDetail.tags.manufacturer ) {
        this.toasterService.showError('Please fill all the details', 'Create Device');
        return;
    }
    this.isCreateDeviceAPILoading = true;
    console.log(this.deviceDetail);
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    this.deviceService.createDevice(this.deviceDetail, this.appName).subscribe(
      (response: any) => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Create Device');
        this.onCloseCreateDeviceModal();
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message, 'Create Device');
        // this.onCloseCreateDeviceModal();
      }
    )
  }

  onCloseCreateDeviceModal() {
    $('#createDeviceModal').modal('hide');
    this.deviceDetail = undefined;
  }
}
