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
  constructor(private commonService: CommonService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    console.log(this.filterObj);
    console.log(this.selectedDateRange);
    this.filterObj.last_n_secs = datefns.getUnixTime(new Date(this.filterObj.to_date)) - datefns.getUnixTime(new Date(this.filterObj.from_date));
    this.picker.datePicker.setStartDate(new Date(this.filterObj.from_date * 1000));
    this.picker.datePicker.setEndDate(new Date(this.filterObj.to_date * 1000));
    console.log('this.picker.datePicker ',this.picker.datePicker);
    
  }

  ngOnChanges(changes) {
    if (changes.filterObj) {
      if (this.filterObj.dateOption === 'Custom Range') {
        this.selectedDateRange = 
        datefns.format(new Date(this.filterObj.from_date * 1000), "dd-MM-yyyy HH:mm") +
          ' to ' +
          datefns.format(new Date(this.filterObj.to_date  * 1000),"dd-MM-yyyy HH:mm");
      } else {
        this.selectedDateRange = this.filterObj.dateOption;
        // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
      }
      if (this.picker) {        
        this.picker.datePicker.setStartDate(datefns.getUnixTime(new Date(this.filterObj.from_date)));
        this.picker.datePicker.setEndDate(datefns.getUnixTime(new Date(this.filterObj.to_date)));
      }
    }
  }

  selectedDate(value: any) {
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = datefns.getUnixTime(dateObj.from_date) * 1000;
      this.filterObj.to_date = datefns.getUnixTime(dateObj.to_date) * 1000;
      // this.filterObj.last_n_secs = this.filterObj.to_date - this.filterObj.from_date;
    } else {
      this.filterObj.from_date = datefns.getUnixTime(new Date(value.start));
      this.filterObj.to_date = datefns.getUnixTime(new Date(value.end));
      // this.filterObj.last_n_secs = undefined;
    }
    if (value.label === 'Custom Range') {
      this.selectedDateRange =
      datefns.format(new Date(value.start),"dd-MM-yyyy HH:mm") + ' to ' + datefns.format(new Date(value.end),"dd-MM-yyyy HH:mm");
    } else {
      this.selectedDateRange = value.label;
    }
    this.selectedDateApplyEmitter.emit(this.filterObj);
  }
}
