import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-columnchart-livedata-component',
  templateUrl: './columnchart-livedata-component.component.html',
  styleUrls: ['./columnchart-livedata-component.component.css']
})
export class ColumnchartLivedataComponentComponent implements OnInit {
  @Input() anchorAdditionalClass: string;
  @Input() hideCancelButtonAddOnClass: string;
  @Input() dvRowCardHeaderClass: string;
  @Input() dvRowCardBodyClass: string;

  @Input() chartConfig: any;
  @Input() headerMessage: string;
  @Input() bodyMessage: string;
  @Input() modalConfig: any;
  @Input() widgetStringFromMenu: string;
  @Input() decodedToken: any;
  @Input() chartId: string;
  @Input() chartTitle: string;
  @Input() hideCancelButton:any;
  @Input() telemetryData:any;
  @Input() loader:any;
  @Input() loaderMessage:any;
  @Input() chartWidth:any;
  @Input() chartHeight:any;
  @Input() isOverlayVisible:any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();  
  @Output() modalOpenEvents: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>(); 
  constructor() { }

  ngOnInit(): void {
  }
}
