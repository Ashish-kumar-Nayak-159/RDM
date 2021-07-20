import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from '../app.constants';

@Component({
  selector: 'app-campaign-management',
  templateUrl: './campaign-management.component.html',
  styleUrls: ['./campaign-management.component.css']
})
export class CampaignManagementComponent implements OnInit {
  contextApp: any;
  tileData: any;

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach(item => {
      if (item.system_name === 'Campaigns') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    console.log(this.tileData);
  }

}
