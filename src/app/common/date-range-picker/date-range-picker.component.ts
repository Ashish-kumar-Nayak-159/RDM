import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
import * as datefns from 'date-fns';
@Component({
  selector: 'app-date-range-picker',
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css'],
})
export class DateRangePickerComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() filterObj: any;
  @Input() disabled: any = false;
  @Input() options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: new Date(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS,
  };
  @Input() selectedDateRange: any;
  @Output() selectedDateApplyEmitter: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  public daterange: any = {};
  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    const isSelectedDateRangeValid = Object.keys(this.options.ranges).length && this.options.ranges.hasOwnProperty(this.selectedDateRange);
    if (isSelectedDateRangeValid) return;
    this.selectedDateRange = Object.keys(this.options.ranges)[0];
    this.filterObj.dateOption = this.selectedDateRange;
    this.filterObj.from_date = datefns.getUnixTime(this.options.ranges[this.selectedDateRange][0]);
    this.filterObj.to_date = datefns.getUnixTime(this.options.ranges[this.selectedDateRange][1]);
  }

  ngAfterViewInit() {
    this.picker.datePicker.setStartDate(new Date(this.filterObj.from_date * 1000));
    this.picker.datePicker.setEndDate(new Date(this.filterObj.to_date * 1000));
  }

  ngOnChanges(changes: any) {
    if (!changes.filterObj) return;

    this.selectedDateRange = this.filterObj.dateOption !== 'Custom Range'
      ? this.filterObj.dateOption
      : datefns.format(new Date(this.filterObj.from_date * 1000), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(new Date(this.filterObj.to_date * 1000), "dd-MM-yyyy HH:mm");

    if (this.picker) {
      this.picker.datePicker.setStartDate(datefns.getUnixTime(new Date(this.filterObj.from_date)));
      this.picker.datePicker.setEndDate(datefns.getUnixTime(new Date(this.filterObj.to_date)));
    }
  }

  selectedDate(value: any) {
    this.filterObj.dateOption = value.label;
    this.filterObj.from_date = datefns.getUnixTime(new Date(value.start));
    this.filterObj.to_date = datefns.getUnixTime(new Date(value.end));
    this.filterObj = {
      ...this.filterObj,
      ...this.commonService.getMomentStartEndDate(this.filterObj.dateOption, this.filterObj)
    };

    this.selectedDateRange = value.label !== 'Custom Range'
      ? value.label
      : datefns.format(new Date(value.start), "dd-MM-yyyy HH:mm") + ' to ' + datefns.format(new Date(value.end), "dd-MM-yyyy HH:mm");
    this.selectedDateApplyEmitter.emit(this.filterObj);
  }
}
