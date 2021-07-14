import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-table',
  templateUrl: './common-table.component.html',
  styleUrls: ['./common-table.component.css']
})
export class CommonTableComponent implements OnInit {

  @Input() tableConfig: any;
  @Input() tableData: any[] = [];
  @Input() isTableDataLoading = false;
  @Input() isTableFilterSelected = false;
  @Output() viewMessageEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onClickOfButton(data, value) {
    this.viewMessageEvent.emit({
      data,
      for: value,
      type: this.tableConfig.type
    });
  }

  resolve(obj, path){
    path = path.split('.');
    let current = obj;
    while (path.length) {
      if (typeof current !== 'object') {
        return undefined;
      }
      if (current) {
        current = current[path.shift()];
      } else {
        return undefined;
      }
    }
    return current;
  }


}
