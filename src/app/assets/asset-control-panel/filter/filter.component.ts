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
import * as datefns from 'date-fns';

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
  edgealerts: boolean;
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
    this.contextApp.menu_settings.legacy_asset_control_panel_menu.forEach((item) => {
      if (item.page === 'edgealerts') {   
        this.edgealerts = item.visible;
      }
    });
  }

  ngAfterViewInit() {
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date),"dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date),"dd-MM-yyyy HH:mm");
    }
    this.cdr.detectChanges();
  }

  selectedDate(filterObj: any) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
    // this.filterObj.last_n_secs = filterObj.last_n_secs;
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
    this.filterObj = {};
    this.filterObj = JSON.parse(JSON.stringify(this.originalFilterObj));
    this.filterObj.dateOption = 'Last 30 Mins';
    if (this.filterObj.dateOption !== 'Custom Range') {
      this.selectedDateRange = this.filterObj.dateOption;
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
      // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
    } else {
      this.selectedDateRange = datefns.format(datefns.fromUnixTime(this.filterObj.from_date),"dd-MM-yyyy HH:mm") + ' to ' + datefns.format(datefns.fromUnixTime(this.filterObj.to_date),"dd-MM-yyyy HH:mm");     
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
