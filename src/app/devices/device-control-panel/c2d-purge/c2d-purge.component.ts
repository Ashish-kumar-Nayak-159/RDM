import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-c2d-purge',
  templateUrl: './c2d-purge.component.html',
  styleUrls: ['./c2d-purge.component.css']
})
export class C2dPurgeComponent implements OnInit {

  messageCount: number;
  @Input() device: Device = new Device();
  userData: any;
  appName: string;
  constructor(
    private deviceService: DeviceService,
    private toasterServie: ToasterService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
    });
  }

  verifyQueueMessages() {
    this.messageCount = null;
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    params = params.set('app', this.appName);
    this.deviceService.getQueueMessagesCount(params).subscribe(
      (response: any) => {
        this.messageCount = response.count;
      }
    );
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    params = params.set(this.device.tags.category === CONSTANTS.IP_GATEWAY ? 'gateway_id' : 'device_id', this.device.device_id);
    params = params.set('app', this.appName);
    this.deviceService.purgeQueueMessages(params).subscribe(
      (response: any) => {
        this.toasterServie.showSuccess(response.message, 'Purge Messages');
        this.verifyQueueMessages();
      }, error => this.toasterServie.showError(error.message, 'Purge messages')
    );
  }

}
