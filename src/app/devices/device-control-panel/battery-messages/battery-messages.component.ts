import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-battery-messages',
  templateUrl: './battery-messages.component.html',
  styleUrls: ['./battery-messages.component.css']
})
export class BatteryMessagesComponent implements OnInit {

  batteryMessageFilter: any = {};
  batteryMessageList: any[] = [];
  @Input() device: Device = new Device();
  isBatteryMessageLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedBatteryMessage: any;
  isFilterSelected = false;
  modalConfig: any;
  batteryMessageTableConfig: any = {};
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.batteryMessageFilter.device_id = this.device.device_id;
    this.batteryMessageTableConfig = {
      type: 'battery',
      headers: ['Timestamp', 'Message ID', 'Battery Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message ID',
          key: 'message_id',
        },
        {
          name: 'Battery Message',
          key: undefined,
        }
      ]
    };
  }

  searchBatteryMessage(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isBatteryMessageLoading = true;
    const obj = {...filterObj};
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
    this.batteryMessageFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceBatteryMessagesList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.batteryMessageList = response.data;
          this.batteryMessageList.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        }
        this.isBatteryMessageLoading = false;
      }, error => this.isBatteryMessageLoading = false
    ));
  }

  openBatteryMessageModal(otherMessage) {
    this.selectedBatteryMessage = otherMessage;
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    $('#batteryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#batteryMessageModal').modal('hide');
      this.selectedBatteryMessage = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
