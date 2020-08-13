import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
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
  @Output() sidebarClickEvent: EventEmitter<any> = new EventEmitter<any>();
  isNotificationLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedNotification: any;
  isFilterSelected = false;
  modalConfig: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.notificationFilter.device_id = this.device.device_id;
    this.notificationFilter.epoch = true;
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
          this.notifications.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        }
        this.isNotificationLoading = false;
      }, error => this.isNotificationLoading = false
    ));
  }

  openNotificationMessageModal() {
    $('#notificationMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedNotification = undefined;
      $('#notificationMessageModal').modal('hide');
    }
  }

  onSideBarClick() {
    this.sidebarClickEvent.emit();
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
