import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from './../../../services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from './../../../services/application/application.service';
import { environment } from './../../../../environments/environment';

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
  applicationData: any;
  appName: any;
  blobSASToken = environment.blobKey;
  constructor(
    private devieService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.getApplicationData();
      this.getDeviceCredentials();
      this.getDeviceConnectionStatus();
    });

  }

  getApplicationData() {
    this.applicationService.getApplications({}).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach(item => {
            if (item.app === this.appName) {
              this.applicationData = item;
            }
          });
        }
      }
    );
  }

  getDeviceCredentials() {
    this.deviceCredentials = undefined;
    const id = (this.device.tags.category && this.device.gateway_id) ? this.device.gateway_id : this.device.device_id;
    this.devieService.getDeviceCredentials(id, this.appName).subscribe(
      response => {
        this.deviceCredentials = response;
      }
    );
  }

  getDeviceConnectionStatus() {
    this.deviceConnectionStatus = undefined;
    const id = (this.device.tags.category && this.device.gateway_id) ? this.device.gateway_id : this.device.device_id;
    this.devieService.getDeviceConnectionStatus(id, this.appName).subscribe(
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
