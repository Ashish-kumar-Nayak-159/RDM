import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';

declare var $: any;
@Component({
  selector: 'app-device-life-cycle-events',
  templateUrl: './device-life-cycle-events.component.html',
  styleUrls: ['./device-life-cycle-events.component.css']
})
export class DeviceLifeCycleEventsComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  lifeCycleEvents: any[] = [];
  @Input() device: Device = new Device();
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
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {

    this.filterObj.device_id = this.device.device_id;

    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.eventTableConfig = {
        type: 'life cycle events',
        headers: ['Timestamp', 'View'],
        data: [
          {
            name: 'Timestamp',
            key: 'local_created_date',
          },
          {
            name: 'Event',
            key: 'event_type',
          }
        ]
      };

    });
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
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Device Life cycle events');
      this.isLifeCycleEventsLoading = false;
      this.isFilterSelected = false;
      return;
    }
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceLifeCycleEvents(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.lifeCycleEvents = response.data;
          this.lifeCycleEvents.forEach(item => {
            const eventMsg = item.event_type.split('.');
            eventMsg[eventMsg.length - 1] = eventMsg[eventMsg.length - 1].replace('Device', '');
            eventMsg[eventMsg.length - 1] = (item.category === CONSTANTS.IP_GATEWAY ? 'Gateway ' : 'Device ' ) +
            eventMsg[eventMsg.length - 1];
            item.event_type = eventMsg[eventMsg.length - 1];
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
          });
        }
        this.isLifeCycleEventsLoading = false;
      }, error => this.isLifeCycleEventsLoading = false
    ));
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }


}
