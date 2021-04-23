import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
  averageMTTR: any;
  displayMode: string;
  averageMTTRString: any;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  today = new Date();
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);

    }));
    // this.filterObj.count = 50;
    this.filterObj.epoch = true;
  }

  onTabChange(type) {
    this.filterObj = {};
    this.averageMTTR = undefined;
    this.averageMTTRString = undefined;
    this.filterObj.epoch = true;
    this.lifeCycleEvents = [];
    if (type === 'machine_failure') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  onDateChange(event) {
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
  }

  onSingleDateChange(event) {
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj.epoch = true;
    if (this.displayMode === 'machine_failure') {
      this.filterObj.countNotShow = true;
    } else {
      this.filterObj.count = 10;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  searchEvents(filterObj) {
    this.isFilterSelected = true;
    this.averageMTTR = undefined;
    this.averageMTTRString = undefined;
    this.isLifeCycleEventsLoading = true;
    const obj = {...filterObj};
    const now = moment().utc();
    if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else if (filterObj.dateOption === 'last 7 days') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(7, 'days')).unix();
    } else if (filterObj.dateOption === 'this week') {
      const today = moment();
      obj.from_date = today.startOf('isoWeek').unix();
      obj.to_date = now.unix();
    }  else if (filterObj.dateOption === 'this month') {
      const today = moment();
      obj.from_date = today.startOf('month').unix();
      obj.to_date = now.unix();
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    console.log(obj.from_date);
    console.log(obj.to_date);
    if (!obj.from_date || !obj.to_date) {
      this.isLifeCycleEventsLoading = false;
      this.toasterService.showError('Date Time selection is required', 'View MTTR Data');
      return;

    }
    delete obj.dateOption;
    delete obj.countNotShow;
    this.filterObj = filterObj;
    this.lifeCycleEvents = [];
    let method;
    if (this.displayMode === 'network_failure') {
      method = this.deviceService.getDeviceNetworkFailureEvents(this.device.app, this.device.device_id, obj);
    } else if (this.displayMode === 'machine_failure') {
      delete obj.count;
      method = this.deviceService.getDeviceMachineFailureEvents(this.device.app, this.device.device_id, obj);
    }
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (response?.data) {
          this.lifeCycleEvents = response.data;
          if (this.displayMode === 'machine_failure') {
            this.averageMTTR = response.mttr;
            this.averageMTTRString = this.splitTime(response.mttr / 60);
          }
          this.lifeCycleEvents .forEach((item, index) => {
            item.local_event_start_time = this.commonService.convertUTCDateToLocal(item.event_start_time);
            item.local_event_end_time = this.commonService.convertUTCDateToLocal(item.event_end_time);
            if (this.displayMode === 'machine_failure') {
              item.mttr = this.splitTime(item.event_timespan_in_sec / 60);
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
      return(d + ' Days, ' + h + ' Hrs, ' + m + ' Mins');
    } else if (h > 0) {
      return(h + ' Hrs, ' + m + ' Mins');
    } else {
      return m + ' Mins';
    }
  }

  openModal(event) {
    this.selectedEvent = JSON.parse(JSON.stringify(event));
    if (!this.selectedEvent.event_metadata) {
      this.selectedEvent.event_metadata = {};
    }
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
    this.deviceService.updateDeviceMTTRData(this.device.app, this.device.device_id, this.selectedEvent.id, this.selectedEvent).
    subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
      this.closeModal();
      this.searchEvents(this.filterObj);
    }, error => {
      this.toasterService.showError(error.message, 'Acknowledge Event');
      this.isEventAcknowledgeAPILoading = false;
    });
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
