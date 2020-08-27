import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';
declare var $: any;
@Component({
  selector: 'app-c2d-message',
  templateUrl: './c2d-message.component.html',
  styleUrls: ['./c2d-message.component.css']
})
export class C2dMessageComponent implements OnInit {

  c2dMsgFilter: any = {};
  c2dMsgs: any[] = [];
  isC2dMsgsLoading = false;
  @Input() device: Device = new Device();
  @Input() type: string = 'all';
  @Input() message: any;
  apiSubscriptions: Subscription[] = [];
  displayMode: string;
  isFilterSelected = false;
  c2dMessageDetail: any;
  c2dResponseDetail: any[];
  modalConfig: any;
  userData: any;
  selectedMessage: any;
  appName: string;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.c2dMsgFilter.device_id = this.device.device_id;
    this.c2dMsgFilter.epoch = true;
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      if (this.type === 'feedback') {
        this.loadMessageDetail(this.message, false);
        this.isFilterSelected = true;
      } else if (this.type === 'response') {
        this.loadResponseDetail(this.message, false);
        this.isFilterSelected = true;
      }
    });


  }

  searchC2DMessages(filterObj) {
    this.isFilterSelected = true;
    this.isC2dMsgsLoading = true;
    const obj = {...filterObj};
    console.log(filterObj);
    const now = moment().utc();
    if (filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else if (filterObj.dateOption === 'custom') {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    delete obj.dateOption;
    console.log(obj);
    this.c2dMsgFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceC2DMessages(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.c2dMsgs = response.data;
          this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        }
        this.isC2dMsgsLoading = false;
      }, error => this.isC2dMsgsLoading = false
    ));
  }

  loadMessageDetail(message, openModalFlag) {
    console.log(message);
    if (!openModalFlag) {
      this.isC2dMsgsLoading = true;
    }
    this.selectedMessage = message;
    this.c2dMessageDetail = undefined;
    this.deviceService.getC2dMessageJSON(message.message_id, this.appName).subscribe(
      (response: any) => {
        if (openModalFlag) {
        this.c2dMessageDetail = response;
        this.openC2DMessageModal();
        } else {
          const arr = [];
          response.local_created_date = this.commonService.convertUTCDateToLocal(response.created_date);
          arr.push(response);
          this.c2dMsgs = arr;
          this.isC2dMsgsLoading = false;
        }
      }, error => this.isC2dMsgsLoading = false
    );
  }

  loadResponseDetail(message, openModalFlag) {
    if (!openModalFlag) {
      this.isC2dMsgsLoading = true;
    }
    this.selectedMessage = message;
    this.c2dResponseDetail = undefined;
    this.deviceService.getC2dResponseJSON(message.message_id, this.appName).subscribe(
      (response: any) => {
        if (response.data) {
          if (openModalFlag) {
          this.c2dResponseDetail = response.data;
          this.openC2DMessageModal();
          } else {
            this.c2dMsgs = response.data;
            this.c2dMsgs.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
            this.isC2dMsgsLoading = false;
          }
        }
      }, error => this.isC2dMsgsLoading = false
    );
  }

  openC2DMessageModal() {
    $('#c2dmessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#c2dmessageModal').modal('hide');
      this.c2dMessageDetail = undefined;
      this.c2dResponseDetail = undefined;
      this.selectedMessage = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
