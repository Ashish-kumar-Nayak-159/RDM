import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { ActivatedRoute } from '@angular/router';

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
    this.deviceService.getQueueMessagesCount(this.device.device_id, this.appName).subscribe(
      (response: any) => {
        this.messageCount = response.count;
      }
    );
  }

  purgeQueueMessages() {
    this.deviceService.purgeQueueMessages(this.device.device_id, this.appName).subscribe(
      response => {
        this.toasterServie.showSuccess('Messages purged successfully', 'Purge Messages');
      }, error => this.toasterServie.showError('Error in purging messages', 'Purge messages')
    );
  }

}
