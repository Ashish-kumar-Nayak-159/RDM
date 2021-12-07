import { Component, OnInit, Input } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';

@Component({
  selector: 'app-trend-analysis',
  templateUrl: './trend-analysis.component.html',
  styleUrls: ['./trend-analysis.component.css']
})
export class TrendAnalysisComponent implements OnInit {

  viewType: string;
  @Input() asset = new Asset();
  isLayout = false;

  ngOnInit(): void {
    this.setViewType('history');
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
