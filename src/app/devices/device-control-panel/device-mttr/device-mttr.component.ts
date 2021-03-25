import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';

@Component({
  selector: 'app-device-mttr',
  templateUrl: './device-mttr.component.html',
  styleUrls: ['./device-mttr.component.css']
})
export class DeviceMttrComponent implements OnInit, OnDestroy {

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
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.filterObj.device_id = this.device.gateway_id;
    } else {
      this.filterObj.device_id = this.device.device_id;
    }

    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);

    }));
    this.filterObj.count = 50;
    this.filterObj.epoch = true;

  }

  searchLifeCycleEvents(filterObj) {
    console.log(filterObj);
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
    this.filterObj = filterObj;
    this.lifeCycleEvents = [];
    this.apiSubscriptions.push(this.deviceService.getDeviceLifeCycleEvents(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          response.data.forEach((item, index) => {
            const nextItem = response.data[index + 1];
            if (item.event_type.includes('DeviceConnected') && nextItem && nextItem.event_type.includes('DeviceDisconnected')) {
              const mttrObj = {
                connected_event_time: item.created_date,
                local_connected_event_time: this.commonService.convertUTCDateToLocal(item.created_date),
                disconnected_event_time: nextItem.created_date,
                local_disconnected_event_time: this.commonService.convertUTCDateToLocal(nextItem.created_date),
                mttr: (moment(item.created_date).diff(moment(nextItem.created_date), 'minutes')),
                mttrString: undefined,
                reason: undefined
              };
              mttrObj.mttrString = this.splitTime(mttrObj.mttr);
              if (mttrObj.mttr < 5) {
                mttrObj.reason = 'Network Failure';
              }
              this.lifeCycleEvents.push(mttrObj);
            }
          });
        }
        this.isLifeCycleEventsLoading = false;
      }, error => this.isLifeCycleEventsLoading = false
    ));
  }

  splitTime(num){
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
