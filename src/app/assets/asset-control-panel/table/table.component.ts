import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() tableConfig: any;
  @Input() tableData: any[] = [];
  @Input() isTableDataLoading = false;
  @Input() isTableFilterSelected = false;
  @Output() viewMessageEvent: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit(): void {
  }

  onClickOfButton(data, value) {
    this.viewMessageEvent.emit({
      data,
      for: value,
      type: this.tableConfig.type
    });
  }

}
