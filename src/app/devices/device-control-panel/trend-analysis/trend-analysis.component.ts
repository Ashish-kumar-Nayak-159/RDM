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
  constructor() { }

  ngOnInit(): void {
  }

}
