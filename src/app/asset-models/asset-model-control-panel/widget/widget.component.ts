import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Input } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.css']
})
export class WidgetComponent implements OnInit {
  @Input() assetModel: any;
  viewType: string;
  widgetStringFromMenu: any;
  widgetObj: any;
  propertyObj: any;
  constructor(private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService) { }
  ngOnInit(): void {
    this.widgetStringFromMenu = this.commonService.getValueFromModelMenuSetting('layout', 'widget');
    this.setViewType('history');


  }

  setViewType(type) {
    this.viewType = type;
  }

}
