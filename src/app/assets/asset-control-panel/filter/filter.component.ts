import { Subscription } from 'rxjs';
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  OnDestroy,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css'],
})
export class FilterComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() filterObj: any;
  @Input() componentState: any;
  originalFilterObj: any = {};
  userData: any;
  @Output() filterSearch: EventEmitter<any> = new EventEmitter<any>();
  contextApp: any;
  constantData: CONSTANTS;
  assets: any[] = [];
  today = new Date();
  subscriptions: Subscription[] = [];
  selectedDateRange: string;
  constructor(private commonService: CommonService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.app = this.contextApp.app;
    if (this.filterObj.gateway_id) {
      // this.getAssetsListByGateway();
    }
    if (!this.filterObj.count) {
      this.filterObj.count = 10;
    }

    this.originalFilterObj = {};
    this.originalFilterObj = { ...this.filterObj };
  }

  ngAfterViewInit() {
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange =
        moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
        ' to ' +
        moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    this.cdr.detectChanges();
  }

  selectedDate(filterObj: any) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
    console.log(JSON.stringify(this.originalFilterObj));
    this.filterObj = {};
    this.filterObj = JSON.parse(JSON.stringify(this.originalFilterObj));
    this.filterObj.dateOption = 'Last 30 Mins';
    console.log(this.filterObj);
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.selectedDateRange =
        moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
        ' to ' +
        moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
