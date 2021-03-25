import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-battery-messages',
  templateUrl: './battery-messages.component.html',
  styleUrls: ['./battery-messages.component.css']
})
export class BatteryMessagesComponent implements OnInit, OnDestroy {

  batteryMessageFilter: any = {};
  batteryMessageList: any[] = [];
  @Input() device: Device = new Device();
  isBatteryMessageLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedBatteryMessage: any;
  isFilterSelected = false;
  modalConfig: any;
  batteryMessageTableConfig: any = {};
  pageType: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.batteryMessageFilter.gateway_id = this.device.device_id;
    } else {
      this.batteryMessageFilter.device_id = this.device.device_id;
    }
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.batteryMessageTableConfig = {
        type: 'battery',
        headers: ['Timestamp', 'Message ID', 'Message'],
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
            name: 'Message',
            key: undefined,
          }
        ]
      };
      if (this.pageType === 'gateway') {
        this.batteryMessageTableConfig.data.splice(1, 1);
        this.batteryMessageTableConfig.data.splice(1, 0, {
          name: 'Asset Name',
          key: 'device_id'
        });
      }
    }));

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
    }else {
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
          this.batteryMessageList.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isBatteryMessageLoading = false;
      }, error => this.isBatteryMessageLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id
      };
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'battery').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openBatteryMessageModal(obj) {
    if (obj.type === this.batteryMessageTableConfig.type) {
      this.selectedBatteryMessage = obj.data;
      this.getMessageData(obj.data).then(message => {
        this.selectedBatteryMessage.message = message;
      });
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      $('#batteryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
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
