import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.css']
})
export class TelemetryComponent implements OnInit, OnDestroy {

  telemetryFilter: any = {};
  telemetry: any[] = [];
  @Input() device: Device = new Device();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.telemetryFilter.device_id = this.device.device_id;
    this.telemetryFilter.epoch = true;
  }

  searchTelemetry(filterObj) {
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
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
    this.telemetryFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetry = response.data;
          this.telemetry.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));

        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedTelemetry = undefined;
      $('#telemetryMessageModal').modal('hide');
    }
  }


  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
