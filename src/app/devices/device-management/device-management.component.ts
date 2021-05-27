import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.css']
})
export class DeviceManagementComponent implements OnInit {
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
    let deviceItem;
    let deviceDataItem = {};
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.page === 'Asset Management' || item.page === 'Device Management') {
        selectedItem = item.showAccordion;
      }
      if (item.page === 'Assets') {
        deviceItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    console.log(this.tileData);
    selectedItem.forEach(item => {
      this.tileData[item.name] = item.value;
    });
    deviceItem.forEach(item => {
      deviceDataItem[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: deviceDataItem['IOT Assets'],
      tab_name: deviceDataItem['IOT Assets Tab Name'],
      table_key: deviceDataItem['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      visibility: deviceDataItem['Legacy Assets'],
      tab_name: deviceDataItem['Legacy Assets Tab Name'],
      table_key: deviceDataItem['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
      visibility: deviceDataItem['IOT Gateways'],
      tab_name: deviceDataItem['IOT Gateways Tab Name'],
      table_key: deviceDataItem['IOT Gateways Table Key Name']
    };
    console.log(this.iotAssetsTab);
  }

  getTabData() {
    this.contextApp.configuration.main_menu.forEach(item => {
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
