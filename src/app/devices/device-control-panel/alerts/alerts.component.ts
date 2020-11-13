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
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {

  alertFilter: any = {};
  alerts: any[] = [];
  @Input() device: Device = new Device();
  isAlertLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedAlert: any;
  isFilterSelected = false;
  modalConfig: any;
  alertTableConfig: any = {};
  pageType: string;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.alertFilter.gateway_id = this.device.device_id;
    } else {
      this.alertFilter.device_id = this.device.device_id;
    }
    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.alertTableConfig = {
        type: 'alert',
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
        this.alertTableConfig.data.splice(1, 1);
        this.alertTableConfig.data.splice(1, 0, {
          name: 'Asset Name',
          key: 'device_id'
        });
      }
    });
    this.alertFilter.epoch = true;

  }

  searchAlerts(filterObj) {
    this.isFilterSelected = true;
    this.isAlertLoading = true;
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
    this.alertFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.alerts = response.data;
          this.alerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isAlertLoading = false;
      }, error => this.isAlertLoading = false
    ));
  }

  getAlertMessageData(alert) {
    return new Promise((resolve) => {
      const obj = {
        app: alert.app,
        id: alert.id
      };
      this.deviceService.getDeviceMessageById(obj, 'alert').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      );
    });
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedAlert = obj.data;
    this.getAlertMessageData(obj.data).then(message => {
      this.selectedAlert.message = message;
    });
    this.selectedAlert = obj.data;
    $('#alertMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#alertMessageModal').modal('hide');
      this.selectedAlert = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
