import { Component, OnInit, Input } from '@angular/core';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
declare var $: any;
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
  pageType: string;
  modalConfig: { isDisplaySave: boolean; isDisplayCancel: boolean; saveBtnText: string; cancelBtnText: string; stringDisplay: boolean; };
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
      this.pageType = params.get('listName');
    });
  }

  verifyQueueMessages() {
    this.messageCount = null;
    let params = new HttpParams();
    let deviceId = this.device.device_id;
    if (this.pageType.toLowerCase() === 'nonipdevices') {
      deviceId = this.device.gateway_id;
    }
    params = params.set('device_id', deviceId);
    params = params.set('app', this.appName);
    this.deviceService.getQueueMessagesCount(params).subscribe(
      (response: any) => {
        this.messageCount = response.count;
      }
    );
  }

  openConfirmDialog() {
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true
    };
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    console.log(eventType);
    if (eventType === 'save'){
      this.purgeQueueMessages();
    }
    $('#confirmMessageModal').modal('hide');
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    let deviceId = this.device.device_id;
    if (this.pageType.toLowerCase() === 'nonipdevices') {
      deviceId = this.device.gateway_id;
    }
    params = params.set('device_id', deviceId);
    params = params.set('app', this.appName);
    this.deviceService.purgeQueueMessages(params).subscribe(
      (response: any) => {
        this.toasterServie.showSuccess(response.message, 'Purge Messages');
        this.verifyQueueMessages();
      }, error => this.toasterServie.showError(error.message, 'Purge messages')
    );
  }

}
