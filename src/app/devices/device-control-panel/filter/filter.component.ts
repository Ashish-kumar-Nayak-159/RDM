import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../../app.constants';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filterObj: any;
  originalFilterObj: any = {};
  userData: any;
  @Output() filterSearch: EventEmitter<any> = new EventEmitter<any>();
  appName: any;
  pageType: string;
  constantData: CONSTANTS;
  devices: any[] = [];
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  today = new Date();
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.filterObj.app = this.appName;
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
    });

    if (this.filterObj.gateway_id) {
     // this.getDevicesListByGateway();
    }
    this.filterObj.count = 10;
    this.originalFilterObj = {};
    this.originalFilterObj = {...this.filterObj};
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
    console.log(event);
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
    console.log(event);
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = moment().utc();
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj = {...this.originalFilterObj};
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }
}
