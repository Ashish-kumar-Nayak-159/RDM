import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-asset-management',
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.css']
})
export class AssetManagementComponent implements OnInit {
  contextApp: any;
  tileData: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  componentState;
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getTileName();
    if (this.iotAssetsTab?.visibility) {
      this.componentState = CONSTANTS.IP_DEVICE;
    } else if (this.legacyAssetsTab?.visibility) {
      this.componentState = CONSTANTS.NON_IP_DEVICE;
    } else if (this.iotGatewaysTab?.visibility) {
      this.componentState = CONSTANTS.IP_GATEWAY;
    }
    // this.getTabData();
  }

  getTileName() {
    let selectedItem;
    let assetItem;
    let assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.page === 'Asset Management' || item.page === 'Asset Management') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        assetItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    console.log(this.tileData);
    selectedItem.forEach(item => {
      this.tileData[item.name] = item.value;
    });
    assetItem.forEach(item => {
      assetDataItem[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: assetDataItem['IOT Assets'],
      tab_name: assetDataItem['IOT Assets Tab Name'],
      table_key: assetDataItem['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      visibility: assetDataItem['Legacy Assets'],
      tab_name: assetDataItem['Legacy Assets Tab Name'],
      table_key: assetDataItem['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
      visibility: assetDataItem['IOT Gateways'],
      tab_name: assetDataItem['IOT Gateways Tab Name'],
      table_key: assetDataItem['IOT Gateways Table Key Name']
    };
    console.log(this.iotAssetsTab);
  }

  getTabData() {
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.page === 'Assets') {
        this.iotAssetsTab = item;
      } else if (item.page === 'Non IP Assets') {
        this.legacyAssetsTab = item;
      } else if (item.page === 'Gateways') {
        this.iotGatewaysTab = item;
      }
    });
  }

  onTabChange(type) {
    this.componentState = type;
  }

}
