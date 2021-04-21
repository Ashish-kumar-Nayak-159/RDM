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
  isEventAcknowledgeAPILoading = false;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
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
    // this.filterObj.count = 50;
    this.filterObj.epoch = true;

  }

  searchLifeCycleEvents(filterObj) {
    this.isFilterSelected = true;
    this.isLifeCycleEventsLoading = true;
    const obj = {...filterObj};
    const now = moment().utc();
    if (filterObj.dateOption === '5 mins') {
      obj.event_end_date = now.unix();
      obj.event_start_date = (now.subtract(5, 'minute')).unix();
    } else if (filterObj.dateOption === '30 mins') {
      obj.event_end_date = now.unix();
      obj.event_start_date = (now.subtract(30, 'minute')).unix();
    } else if (filterObj.dateOption === '1 hour') {
      obj.event_end_date = now.unix();
      obj.event_start_date = (now.subtract(1, 'hour')).unix();
    } else if (filterObj.dateOption === '24 hour') {
      obj.event_end_date = now.unix();
      obj.event_start_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (filterObj.from_date) {
        obj.event_start_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.event_end_date = filterObj.to_date.unix();
      }
    }
    if (!obj.event_start_date || !obj.event_end_date) {
      this.isLifeCycleEventsLoading = false;
      this.toasterService.showError('Date Time selection is required', 'View MTTR Data');
      return;

    }
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.lifeCycleEvents = [];
    this.apiSubscriptions.push(this.deviceService.getDeviceMTTRData(this.device.app, this.device.device_id, obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.lifeCycleEvents = response.data;
          this.lifeCycleEvents .forEach((item, index) => {
            item.local_event_start_time = this.commonService.convertUTCDateToLocal(item.event_start_time);
            item.local_event_end_time = this.commonService.convertUTCDateToLocal(item.event_end_time);
            item.mttr = this.splitTime(item.event_timespan_in_sec / 60);
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

  openModal(event) {
    this.selectedEvent = event;
    $('#eventAcknowledgeModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal() {
    this.selectedEvent = undefined;
    $('#eventAcknowledgeModal').modal('hide');
  }

  acknowledgeEvent() {
    if (!this.selectedEvent.event_reason) {
      this.toasterService.showError('Acknowledgement reason is required.', 'Acknowledge Event');
      return;
    }
    this.isEventAcknowledgeAPILoading = true;
    this.selectedEvent.event_metadata = {};
    this.deviceService.updateDeviceMTTRData(this.device.app, this.device.device_id, this.selectedEvent.id, this.selectedEvent).
    subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
      this.closeModal();
      this.searchLifeCycleEvents(this.filterObj);
    }, error => {
      this.toasterService.showError(error.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
    });
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
