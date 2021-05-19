import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-common-data-table',
  templateUrl: './common-data-table.component.html',
  styleUrls: ['./common-data-table.component.css']
})
export class CommonDataTableComponent implements OnInit, OnChanges {

  @Input() tableConfig: any;
  @Input() tableData: any[] = [];
  @Output() btnClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() loadMoreEvent: EventEmitter<any> = new EventEmitter<any>();
  filteredTableData: any[] = [];
  noTableDataMessage: string;
  tableFilterObj = {};
  isFilterSelected = false;
  constructor() { }

  ngOnInit(): void {
    console.log(this.tableData);
    this.filteredTableData = JSON.parse(JSON.stringify(this.tableData));
    if (this.tableData.length === 0) {
      this.noTableDataMessage = 'No data available.';
    }
  }

  ngOnChanges(changes) {
    if (changes.tableData) {
      this.filteredTableData = JSON.parse(JSON.stringify(this.tableData));
      if (this.tableData.length === 0) {
        this.noTableDataMessage = 'No data available.';
      }
    }
  }

  onLoadMoreClick() {
    this.loadMoreEvent.emit();
  }

  resolve(obj, path){
    path = path.split('.');
    let current = obj;
    while (path.length) {
      if (typeof current !== 'object') {
        return undefined;
      }
      current = current[path.shift()];
    }
    return current;
  }

  onClickOfButton(data, id) {
    this.btnClickEvent.emit({
      data,
      for: id
    });
  }

  onStringValueChange() {
    this.isFilterSelected = false;
    Object.keys(this.tableFilterObj).forEach(key => {
      if (this.tableFilterObj[key]) {
        this.isFilterSelected = true;
      } else {
        delete this.tableFilterObj[key];
      }
    });
    if (this.isFilterSelected) {
      this.resetFilterData(0, this.tableData);
    } else {
      this.filteredTableData = JSON.parse(JSON.stringify(this.tableData));
    }
  }

  resetFilterData(index, data) {
    const keys = Object.keys(this.tableFilterObj);
    const key = keys[index];
    console.log('key  ', key);
    const arr = [];
    data.forEach(dataItem => {
      if (dataItem[key]?.toString()?.toLowerCase().includes(this.tableFilterObj[key].toString()?.toLowerCase())) {
        arr.push(dataItem);
      }
    });
    index++;
    this.filteredTableData = JSON.parse(JSON.stringify(arr));
    if (this.filteredTableData.length === 0) {
      this.noTableDataMessage = 'No data available for selected filter';
    }
    if (index < keys.length) {
      this.resetFilterData(index, arr);
    }
  }

}
