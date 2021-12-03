import { Component, OnInit,Input,Output,EventEmitter } from '@angular/core';

@Component({
  selector: 'app-common-widget',
  templateUrl: './common-widget.component.html',
  styleUrls: ['./common-widget.component.css']
})
export class CommonWidgetComponent implements OnInit {  
  @Input() innerClass: string;
  @Input() overlayLeft: string;
  @Input() telmetryDivAddonClass: string;
  @Input() chartConfig:any;
  @Input() headerMessage: string;
  @Input() bodyMessage:string;
  @Input() modalConfig : any;
  @Input() telemetryObj:any;
  @Input() asset:boolean;
  @Input() widgetStringFromMenu : string;
  @Input() decodedToken : any;
  @Output() modalEvents: EventEmitter<any> = new EventEmitter<any>();  
  @Output() modalOpenEvents: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>(); 
  constructor() { }

  ngOnInit(): void {
  }
}
