import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-heartbeat',
  templateUrl: './heartbeat.component.html',
  styleUrls: ['./heartbeat.component.css']
})
export class HeartbeatComponent implements OnInit, OnDestroy {

  heartBeatFilter: any = {};
  heartbeats: any[] = [];
  @Input() device: Device = new Device();
  isHeartbeatLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedHeartbeat: any;
  isFilterSelected = false;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.heartBeatFilter.device_id = this.device.device_id;
  }

  searchHeartBeat(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isHeartbeatLoading = true;
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
    this.heartBeatFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceHeartBeats(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.heartbeats = response.data;
          this.heartbeats.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date));
        }
        this.isHeartbeatLoading = false;
      }, error => this.isHeartbeatLoading = false
    ));
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.selectedHeartbeat = undefined;
      $('#heartbeatMessageModal').modal('hide');
    }
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
