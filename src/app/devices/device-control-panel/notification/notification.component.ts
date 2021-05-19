import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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

  notificationFilter: any = {};
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
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    if (this.device?.tags?.category === CONSTANTS.IP_GATEWAY) {
      this.notificationFilter.gateway_id = this.device.device_id;
    } else {
      this.notificationFilter.device_id = this.device.device_id;
    }
<<<<<<< HEAD
    this.notificationTableConfig = {
      type: 'notification',
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
=======
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.notificationTableConfig = {
        type: 'notification',
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
    }));
>>>>>>> e25e9306ac45909c9490dae645e687d9f43e099c
    this.notificationFilter.epoch = true;
  }

  searchNotifications(filterObj) {
    this.isFilterSelected = true;
    this.isNotificationLoading = true;
    const obj = {...filterObj};

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Notifications');
      this.isNotificationLoading = false;
      this.isFilterSelected = false;
      return;
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
