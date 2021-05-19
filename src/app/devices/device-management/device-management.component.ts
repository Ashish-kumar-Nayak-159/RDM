import { CONSTANTS } from './../../app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.css']
})
export class DeviceManagementComponent implements OnInit, AfterViewInit {
  contextApp: any;
  tileData: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
<<<<<<< HEAD
  componentState = CONSTANTS.IP_DEVICE;
  constantData = CONSTANTS;
=======
  @ViewChild('staticTabs', { static: false }) staticTabs: TabsetComponent;
>>>>>>> e25e9306ac45909c9490dae645e687d9f43e099c
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
<<<<<<< HEAD
    // this.getTabData();
=======
    this.getTabData();
    const obj = {
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app
        },
        {
          title: this.tileData && this.tileData[0] ? this.tileData[0]?.value : '',
          url: 'applications/' + this.contextApp.app + '/asset/management'
        }
      ]
    };
    this.commonService.breadcrumbEvent.emit(obj);
    console.log(obj);
  }

  ngAfterViewInit() {
    if (this.iotAssetsTab.visible) {
      this.selectedTab = 'iot-devices';
    } else if (this.legacyAssetsTab.visible) {
      this.staticTabs.tabs[0].active = true;
      this.selectedTab = 'legacy-devices';
    } else if (this.iotGatewaysTab.visible) {
      this.staticTabs.tabs[0].active = true;
      this.selectedTab = 'iot-gateways';
    }
>>>>>>> e25e9306ac45909c9490dae645e687d9f43e099c
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
      tab_name: deviceDataItem['IOT Assets Tab Name'],
      table_key: deviceDataItem['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      tab_name: deviceDataItem['Legacy Assets Tab Name'],
      table_key: deviceDataItem['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
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
