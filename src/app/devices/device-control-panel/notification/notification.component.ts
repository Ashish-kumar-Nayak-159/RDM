import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {

  notificationFilter: any = {};
  notifications: any[] = [];
  @Input() device: Device = new Device();
  isNotificationLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedNotification: any;
  isFilterSelected = false;
  modalConfig: any;
  notificationTableConfig: any = {};
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.notificationFilter.device_id = this.device.device_id;
    this.notificationFilter.epoch = true;
    this.notificationTableConfig = {
      type: 'notification',
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
  }

  searchNotifications(filterObj) {
    this.isFilterSelected = true;
    this.isNotificationLoading = true;
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
    this.notificationFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceNotifications(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.notifications = response.data;
          this.notifications.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isNotificationLoading = false;
      }, error => this.isNotificationLoading = false
    ));
  }

  openNotificationMessageModal(obj) {
    if (obj.type === this.notificationTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedNotification = obj.data;
    $('#notificationMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }

  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#notificationMessageModal').modal('hide');
      this.selectedNotification = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
