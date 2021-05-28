import { Subscription } from 'rxjs';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../../app.constants';
import * as moment from 'moment';
import { DaterangepickerComponent } from 'ng2-daterangepicker';


@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() filterObj: any;
  @Input() componentState: any;
  originalFilterObj: any = {};
  userData: any;
  @Output() filterSearch: EventEmitter<any> = new EventEmitter<any>();
  contextApp: any;
  constantData: CONSTANTS;
  devices: any[] = [];
  @ViewChild(DaterangepickerComponent, {static: false}) picker: DaterangepickerComponent;
  today = new Date();
  subscriptions: Subscription[] = [];
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS
  };
  selectedDateRange: string;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.app = this.contextApp.app;
    if (this.filterObj.gateway_id) {
     // this.getDevicesListByGateway();
    }
    if (!this.filterObj.count) {
      this.filterObj.count = 10;
    }

    this.originalFilterObj = {};
    this.originalFilterObj = {...this.filterObj};

  }

  ngAfterViewInit() {

    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
      moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    setTimeout(() => {
    if (this.filterObj.from_date) {
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
    }
    if (this.filterObj.to_date) {
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
    }
    }, 500);
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
  }

  selectedDate(value: any, datepicker?: any) {
    // this.filterObj.from_date = moment(value.start).utc().unix();
    // this.filterObj.to_date = moment(value.end).utc().unix();
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    console.log(this.filterObj);
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
    this.filterObj = {};
    this.filterObj = {...this.originalFilterObj};
    console.log(this.filterObj);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


}
