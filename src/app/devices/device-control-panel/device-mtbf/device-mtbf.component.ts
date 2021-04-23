import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';

@Component({
  selector: 'app-device-mtbf',
  templateUrl: './device-mtbf.component.html',
  styleUrls: ['./device-mtbf.component.css']
})
export class DeviceMtbfComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  lifeCycleEvents: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  isLifeCycleEventsLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedEvent: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  eventTableConfig: any = {};
  avrgMTBF: any;
  avrgMTBFString: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    this.filterObj.countNotShow = true;

    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);

    }));
    this.filterObj.epoch = true;

  }

  searchMTBFEvents(filterObj) {
    this.avrgMTBF = undefined;
    this.avrgMTBFString = undefined;
    this.isFilterSelected = true;
    this.isLifeCycleEventsLoading = true;
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
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    delete obj.dateOption;
    delete obj.countNotShow;
    this.filterObj = filterObj;
    this.lifeCycleEvents = [];
    this.apiSubscriptions.push(this.deviceService.getDeviceMTBFEvents(this.device.app, this.device.device_id, obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.lifeCycleEvents = response.data;
          this.avrgMTBF = response.mtbf;
          this.avrgMTBFString = this.splitTime(response.mtbf / 60);
        }
        this.lifeCycleEvents .forEach((item, index) => {
          item.local_event_start_time = this.commonService.convertUTCDateToLocal(item.event_start_time);
          item.local_event_end_time = this.commonService.convertUTCDateToLocal(item.event_end_time);
          item.mtbf = this.splitTime(item.event_timespan_in_sec / 60);
        });
        this.isLifeCycleEventsLoading = false;
      }, error => this.isLifeCycleEventsLoading = false
    ));
  }

  splitTime(num){
    // const numberOfHours = minutes / 60;
    const d = Math.floor(num / 1440); // 60*24
    const h = Math.floor((num - (d * 1440)) / 60);
    const m = Math.round(num % 60);
    if (d > 0){
      return(d + ' D, ' + h + ' Hrs, ' + m + ' Mins');
    } else if (h > 0) {
      return(h + ' Hrs, ' + m + ' Mins');
    } else {
      return m + ' Mins';
    }
  }




  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
