import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy, Output } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {

  @Input() notificationFilter: any = {};
  notifications: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  isNotificationLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedNotification: any;
  isFilterSelected = false;
  modalConfig: any;
  notificationTableConfig: any = {};
  pageType: string;
  contextApp: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.apiSubscriptions.push(this.deviceService.searchNotificationsEventEmitter.subscribe(
      () => this.searchNotifications(this.notificationFilter)));
    // this.notificationFilter.device_id = this.device.device_id;
    // this.notificationFilter.count = 10;
    // this.notificationFilter.app = this.contextApp.app;
    this.notificationTableConfig = {
      type: 'notification',
      dateRange: '',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message',
          key: 'message_text',
        },
        {
          name: '',
          key: undefined,
        }
      ]
    };
    // this.searchNotifications(this.notificationFilter, false);
    this.notificationFilter.epoch = true;
    
  }

  // loadFromCache() {
  //   const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
  //   if (item.dateOption) {
  //     this.notificationFilter.dateOption = item.dateOption;
  //     if (item.dateOption !== 'Custom Range') {
  //       const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
  //       this.notificationFilter.from_date = dateObj.from_date;
  //       this.notificationFilter.to_date = dateObj.to_date;
  //     } else {
  //       this.notificationFilter.from_date = item.from_date;
  //       this.notificationFilter.to_date = item.to_date;
  //     }
  //   }
  //   this.searchNotifications(this.notificationFilter, false);
  // }

  searchNotifications(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isNotificationLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = {...filterObj};
    
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Notifications');
      this.isNotificationLoading = false;
      this.isFilterSelected = false;
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    delete obj.dateOption;
    this.notificationFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceNotifications(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.notifications = response.data;
          this.notifications.forEach(item => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
            item.message_text = item.message;
          });
        }
        if (this.notificationFilter.dateOption !== 'Custom Range') {
          this.notificationTableConfig.dateRange = this.notificationFilter.dateOption;
        }
        else {
          this.notificationTableConfig.dateRange = "this selected range";
        }
        this.isNotificationLoading = false;
      }, error => this.isNotificationLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        device_id: this.device.device_id,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  this.commonService.convertDateToEpoch(dataobj.message_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'notification').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openNotificationMessageModal(obj) {
    if (obj.type === this.notificationTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedNotification = obj.data;
    this.getMessageData(obj.data).then(message => {
      this.selectedNotification.message = message;
    });
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
