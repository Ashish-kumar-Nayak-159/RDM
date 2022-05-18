import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
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
  sortDir = 1;
  isFilterSelected = false;
  constructor(private applicationService: ApplicationService,
    private commonService: CommonService,) { }

  ngOnInit(): void {
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

  scrollToTop() {
    $('#table-top').animate({ scrollTop: "0px" });
  }

  resolve(obj, path) {
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
      if (this.tableFilterObj[key] !== undefined && this.tableFilterObj[key] !== null) {
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

  onClear(item) {
    this.tableFilterObj[item.data_key] = undefined;
    this.onStringValueChange();

  }

  onSortClick(event, filterBy) {
    console.log(event.currentTarget.classList)
    let target = event.currentTarget,
      classList = target.classList;

    if (classList.contains('fa-chevron-up')) {
      classList.remove('fa-chevron-up');
      classList.add('fa-chevron-down');
      this.sortDir = -1;
    } else {
      classList.add('fa-chevron-up');
      classList.remove('fa-chevron-down');
      this.sortDir = 1;
    }
    this.sortArr(filterBy,classList);
  }
  sortArr(key: any,classList?) {
    debugger
    let dateParse = Date.parse(this.filteredTableData[0][key]);
    let isDate = isNaN(dateParse);
    this.filteredTableData.sort((a, b) => {

      if (!isDate) {
        let x:any = new Date(a[key])
        let y:any = new Date(b[key])
         if(classList.contains('fa-chevron-up')){

           return x.getTime() - y.getTime(); 
         }
         else{
           return y.getTime()  - x.getTime();
         }
      }
      else {
        a = a[key].toLowerCase();
        console.log(a)
        b = b[key].toLowerCase();
        console.log(b)
        return a.localeCompare(b) * this.sortDir;
      }
    });
  }

  resetFilterData(index, data) {
    const keys = Object.keys(this.tableFilterObj);
    const key = keys[index];
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
