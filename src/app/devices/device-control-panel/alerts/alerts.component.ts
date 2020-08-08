import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {

  alertFilter: any = {};
  alerts: any[] = [];
  @Input() device: Device = new Device();
  isAlertLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedAlert: any;
  isFilterSelected = false;
  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.alertFilter.device_id = this.device.device_id;
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
    } else if (filterObj.dateOption === 'custom') {
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
        }
        this.isAlertLoading = false;
      }, error => this.isAlertLoading = false
    ));
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedAlert = undefined;
      $('#alertMessageModal').modal('hide');
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
