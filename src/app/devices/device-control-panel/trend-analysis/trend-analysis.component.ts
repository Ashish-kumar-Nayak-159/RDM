import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trend-analysis',
  templateUrl: './trend-analysis.component.html',
  styleUrls: ['./trend-analysis.component.css']
})
export class TrendAnalysisComponent implements OnInit {

  viewType: string;
  constructor() { }

  ngOnInit(): void {
  }

}
