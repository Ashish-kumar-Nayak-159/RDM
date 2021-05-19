import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-common-table-filter',
  templateUrl: './common-table-filter.component.html',
  styleUrls: ['./common-table-filter.component.css']
})
export class CommonTableFilterComponent implements OnInit {

  @Input() item: any;
  @Input() headerIndex: any;
  @Input() tableData: any[] = [];
  originalTableData: any[] = [];
  @Output() updateTableData: EventEmitter<any[]> = new EventEmitter<any[]>();
  constructor() { }

  ngOnInit(): void {
    this.originalTableData = JSON.parse(JSON.stringify(this.tableData));
  }

  onNumberValueChange(event) {
    const value = event.target.value;
    const arr = [];
    this.tableData.forEach(dataItem => {
      if (dataItem[this.item.data_key] === value) {
        arr.push(dataItem);
      }
    });
    this.updateTableData.emit(arr);
  }

  onStringValueChange(event) {
    console.log(event);
    const value = event.target.value;
    if (value) {
    console.log(value);
    const arr = [];
    this.tableData.forEach(dataItem => {
      console.log(dataItem[this.item.data_key]);
      console.log(dataItem[this.item.data_key]?.toLowerCase().includes(value.toLowerCase()));
      if (dataItem[this.item.data_key]?.toLowerCase().includes(value.toLowerCase())) {
        arr.push(dataItem);
      }
    });
    console.log(arr.length);
    this.updateTableData.emit(arr);
    }
    else {
      this.updateTableData.emit(this.originalTableData);
    }
  }
}
