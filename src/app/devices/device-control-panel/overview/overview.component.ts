import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from './../../../services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit {

  @Input() device: Device = new Device();
  deviceCredentials: any;
  deviceConnectionStatus: any;
  userData: any;
  isCopyClicked = false;
  isViewClicked = false;
  applicationData: {logo: string, icon: string};
  constructor(
    private devieService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = CONSTANTS.APP_DATA[this.userData.app];
    this.getDeviceCredentials();
    this.getDeviceConnectionStatus();
  }

  getDeviceCredentials() {
    this.deviceCredentials = undefined;
    this.devieService.getDeviceCredentials(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.deviceCredentials = response;
      }
    );
  }

  getDeviceConnectionStatus() {
    this.deviceConnectionStatus = undefined;
    this.devieService.getDeviceConnectionStatus(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.deviceConnectionStatus = response;
        this.deviceConnectionStatus.local_updated_date =
          this.commonService.convertUTCDateToLocal(this.deviceConnectionStatus.updated_date);
      }
    );
  }

  copyConnectionString() {
    this.isCopyClicked = true;
    navigator.clipboard.writeText(this.deviceCredentials.primary_connection_string);
    setTimeout(() => this.isCopyClicked = false, 1000);
  }

  viewonnectionString() {
    this.isViewClicked = true;
    setTimeout(() => this.isViewClicked = false, 3000);
  }


}
