import { AssetService } from './../../services/assets/asset.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-asset-management',
  templateUrl: './asset-management.component.html',
  styleUrls: ['./asset-management.component.css'],
})
export class AssetManagementComponent implements OnInit {
  contextApp: any;
  tileData: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  componentState;
  constantData = CONSTANTS;
  decodedToken: any;
  isOpenAssetCreateModal = false;
  gateways: any[] = [];
  subscriptions: any[] = [];
  tabData: { tab_name: any; table_key: any };
  constructor(private commonService: CommonService, private assetService: AssetService) {}

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    if (this.iotAssetsTab?.visibility) {
      this.componentState = CONSTANTS.IP_ASSET;
      await this.onTabChange(this.componentState);
    } else if (this.legacyAssetsTab?.visibility) {
      this.componentState = CONSTANTS.NON_IP_ASSET;
      await this.onTabChange(this.componentState);
    } else if (this.iotGatewaysTab?.visibility) {
      this.componentState = CONSTANTS.IP_GATEWAY;
      await this.onTabChange(this.componentState);
    }
    // this.getTabData();
  }

  getTileName() {
    let selectedItem;
    let assetItem;
    let assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Asset Management') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        assetItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    assetItem.forEach((item) => {
      assetDataItem[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: assetDataItem['IoT Assets'],
      tab_name: assetDataItem['IoT Assets Tab Name'],
      table_key: assetDataItem['IoT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      visibility: assetDataItem['Legacy Assets'],
      tab_name: assetDataItem['Legacy Assets Tab Name'],
      table_key: assetDataItem['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      visibility: assetDataItem['IoT Gateways'],
      tab_name: assetDataItem['IoT Gateways Tab Name'],
      table_key: assetDataItem['IoT Gateways Table Key Name'],
    };
    if (this.componentState === CONSTANTS.IP_ASSET) {
      this.tabData = {
        tab_name: assetDataItem['IoT Assets Tab Name'],
        table_key: assetDataItem['IoT Assets Table Key Name'],
      };
    }
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      this.tabData = {
        tab_name: assetDataItem['Legacy Assets Tab Name'],
        table_key: assetDataItem['Legacy Assets Table Key Name'],
      };
    }
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      this.tabData = {
        tab_name: assetDataItem['IoT Gateways Tab Name'],
        table_key: assetDataItem['IoT Gateways Table Key Name'],
      };
    }
  }

  onTabChange(type) {
    this.componentState = type;
    this.getTileName();
  }

  onCreateAssetCancelModal() {
    this.isOpenAssetCreateModal = false;
  }

  getAssets() {
    const componentState = this.componentState;
    this.componentState = undefined;
    setTimeout(() => {
      this.componentState = componentState;
    }, 500);
  }

  openAssetCreateModal() {
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      this.getGatewayList();
    }
    this.isOpenAssetCreateModal = true;
  }

  getGatewayList() {
    this.gateways = [];
    const obj = {
      app: this.contextApp.app,
      type: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
    };
    this.subscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe((response: any) => {
        if (response.data) {
          this.gateways = response.data;
        }
      })
    );
  }
}
