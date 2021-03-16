import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html',
  styleUrls: ['./device-management.component.css']
})
export class DeviceManagementComponent implements OnInit {
  contextApp: any;
  tileData: any;
  selectedTab: any;
  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    console.log('2000000    ', this.contextApp);
    this.getTileName();
    this.commonService.breadcrumbEvent.emit({
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
    });
    if (this.contextApp.configuration.main_menu[2].visible) {
      this.selectedTab = 'iot-devices';
    } else if (this.contextApp.configuration.main_menu[3].visible) {
      this.selectedTab = 'legacy-devices';
    } else if (this.contextApp.configuration.main_menu[9].visible) {
      this.selectedTab = 'iot-gateways';
    }

  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.page === 'Device Management') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem;
    console.log('1111111   ', this.tileData);
  }

  onTabChange(type) {
    this.selectedTab = type;
  }

}
