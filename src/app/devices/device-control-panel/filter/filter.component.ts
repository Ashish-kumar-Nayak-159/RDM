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
  @ViewChild(DaterangepickerComponent, {static: false}) datepicker: DaterangepickerComponent;
  today = new Date();
  subscriptions: Subscription[] = [];
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    timePicker: true,
    ranges: {
      'Last 5 Mins': [moment().subtract(5, 'minutes'), moment()],
      'Last 30 Mins': [moment().subtract(30, 'minutes'), moment()],
      'Last 1 hour': [moment().subtract(1, 'hour'), moment()],
      'Last 24 hours': [moment().subtract(24, 'hours'), moment()],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  };
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
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
  }

  selectedDate(value: any, datepicker?: any) {
    this.filterObj.from_date = moment(value.start).utc().unix();
    this.filterObj.to_date = moment(value.end).utc().unix();
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
