import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';
import { DaterangepickerComponent } from 'ng2-daterangepicker';

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
    maxDate: moment(),
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
    this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
    this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
  }

  ngOnChanges(changes) {
    console.log('changessss    ', changes);
    if (changes.filterObj) {
      console.log(this.filterObj);
      if (this.filterObj.dateOption === 'Custom Range') {
        this.selectedDateRange =
          moment(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
          moment(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
      } else {
        this.selectedDateRange = this.filterObj.dateOption;
      }
      this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
    }
  }

  selectedDate(value: any) {
    console.log(value);
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    console.log(this.filterObj);
    if (value.label === 'Custom Range') {
      this.selectedDateRange =
        moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    this.selectedDateApplyEmitter.emit(this.filterObj);
  }
}
