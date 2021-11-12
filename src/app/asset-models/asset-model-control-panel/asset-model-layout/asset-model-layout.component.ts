import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-asset-model-layout',
  templateUrl: './asset-model-layout.component.html',
  styleUrls: ['./asset-model-layout.component.css'],
})
export class AssetModelLayoutComponent implements OnInit {
  @Input() assetModel: any;
  viewType: string;
  widgetStringFromMenu: any;
  constructor(private commonService: CommonService) {}
  ngOnInit(): void {
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.setViewType('history');
  }

  setViewType(type) {
    this.viewType = type;
  }
}
