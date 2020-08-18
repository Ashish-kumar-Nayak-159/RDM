import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../../app.constants';

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
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.filterObj.app = this.userData.app;
    this.filterObj.count = 10;
    this.originalFilterObj = {};
    this.originalFilterObj = {...this.filterObj};
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
  }

  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj = {...this.originalFilterObj};
  }
}
