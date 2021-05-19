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
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit, OnDestroy {

  alertFilter: any = {};
  alerts: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
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
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.alertFilter.gateway_id = this.device.device_id;
    } else {
      this.alertFilter.device_id = this.device.device_id;
    }
    this.alertTableConfig = {
      type: 'alert',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Code',
          key: 'code',
        },
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message',
          key: 'message'
        },
        {
          name: '',
          key: undefined,
        }
      ]
    };
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      // this.alertTableConfig.data.splice(1, 1);
      this.alertTableConfig.data.splice(2, 0, {
        name: 'Asset Name',
        key: 'device_id'
      });
    }
    this.alertFilter.epoch = true;

  }

  searchAlerts(filterObj) {
    this.isFilterSelected = true;
    this.isAlertLoading = true;
    const obj = {...filterObj};
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Alert Data');
      this.isAlertLoading = false;
      this.isFilterSelected = false;
      return;
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
        id: alert.id,
        device_id: this.device.device_id,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  this.commonService.convertDateToEpoch(alert.message_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'alert').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedAlert = JSON.parse(JSON.stringify(obj.data));
    this.getAlertMessageData(obj.data).then(message => {
      this.selectedAlert.message = message;
    });
    // this.selectedAlert = obj.data;
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
