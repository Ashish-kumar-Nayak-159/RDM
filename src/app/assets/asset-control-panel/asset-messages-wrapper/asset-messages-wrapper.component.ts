import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';

@Component({
  selector: 'app-asset-messages-wrapper',
  templateUrl: './asset-messages-wrapper.component.html',
  styleUrls: ['./asset-messages-wrapper.component.css'],
})
export class AssetMessagesWrapperComponent implements OnInit {
  filterObj: any = {};
  originalFilterObj: any = {};
  notifications: any[] = [];
  @Input() asset: Asset = new Asset();
  @Input() componentState: any;
  contextApp: any;
  constructor(private commonService: CommonService, private assetService: AssetService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.asset_id = this.asset.asset_id;
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.displayNotificationOptions = true;
    this.filterObj.source = 'Notification';
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.loadFromCache();
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
        this.filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    this.search(this.filterObj);
  }

  search(filterObj) {
    this.filterObj = filterObj;
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    setTimeout(() => this.assetService.searchNotificationsEventEmitter.emit(), 100);
  }
}
