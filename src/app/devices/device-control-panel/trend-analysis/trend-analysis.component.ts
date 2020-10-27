import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';

@Component({
  selector: 'app-trend-analysis',
  templateUrl: './trend-analysis.component.html',
  styleUrls: ['./trend-analysis.component.css']
})
export class TrendAnalysisComponent implements OnInit {

  viewType: string;
  @Input() device = new Device();
  isLayout = false;
  constructor() { }

  ngOnInit(): void {
  }

  setViewType(type){
    this.isLayout = false;
    this.viewType = type;
    $('.overlay').hide();
    if (type === 'layout'){
      $('.overlay').show();
      this.viewType = 'history';
      this.isLayout = true;
    }
  }
}
