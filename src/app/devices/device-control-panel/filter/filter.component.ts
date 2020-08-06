import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {

  @Input() filterObj: any;
  originalFilterObj: any = {};
  @Output() filterSearch: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    this.filterObj.count = 10;
    this.originalFilterObj = {};
    this.originalFilterObj = {...this.filterObj};
  }


  search() {
    this.filterSearch.emit(this.filterObj);
  }

  clear() {
    this.filterSearch.emit(this.originalFilterObj);
    this.filterObj = {};
    this.filterObj = {...this.originalFilterObj};
  }
}
