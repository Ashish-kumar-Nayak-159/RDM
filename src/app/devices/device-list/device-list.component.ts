import { Component, OnInit } from '@angular/core';
import { DeviceListFilter, Device } from 'src/app/models/device.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DeviceService } from './../../services/devices/device.service';
import { ThrowStmt } from '@angular/compiler';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css']
})
export class DeviceListComponent implements OnInit {

  deviceFilterObj: DeviceListFilter = new DeviceListFilter();
  devicesList: Device[] = [];
  isDeviceListLoading = false;
  userData: any;
  isFilterSelected = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    this.commonService.breadcrumbEvent.emit(this.userData.app + '/Devices');
    this.deviceFilterObj.app = this.userData.app;
    this.route.queryParamMap.subscribe(
      params => {
        if (params.get('state')) {
          this.deviceFilterObj.connection_state = params.get('state');
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
}
