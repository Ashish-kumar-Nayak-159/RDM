import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit, OnDestroy {

  c2dMsgFilter: any = {};
  c2dMsgs: any[] = [];
  isC2dMsgsLoading = false;
  @Input() device: Device = new Device();
  apiSubscriptions: Subscription[] = [];
  displayMode: string;
  isFilterSelected = false;
  c2dMessageDetail: any;
  c2dResponseDetail: any[];
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.c2dMsgFilter.device_id = this.device.device_id;
    this.c2dMsgFilter.epoch = true;
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

  loadMessageDetail(message) {
    this.c2dMessageDetail = undefined;
    this.deviceService.getC2dMessageJSON(message.message_id).subscribe(
      response => {
        this.c2dMessageDetail = response;
      }
    );
  }

  loadResponseDetail(message) {
    this.c2dResponseDetail = undefined;
    this.deviceService.getC2dResponseJSON(message.message_id).subscribe(
      (response: any) => {
        if (response.data) {
          this.c2dResponseDetail = response.data;
        }
      }
    );
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#c2dmessageModal').modal('hide');
      this.c2dMessageDetail = undefined;
      this.c2dResponseDetail = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
