import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-menu-settings',
  templateUrl: './application-menu-settings.component.html',
  styleUrls: ['./application-menu-settings.component.css']
})
export class ApplicationMenuSettingsComponent implements OnInit {

  @Input() applicationData: any;
  saveMenuSettingAPILoading = false;
  originalApplicationData: any;
  sideMenuList = [...CONSTANTS.SIDE_MENU_LIST];
  activeTab = 'main-menu';
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    if (this.applicationData.configuration && this.applicationData.configuration.length === 0) {
      this.applicationData.configuration = this.sideMenuList;
    } else {
      console.log(this.applicationData.configuration);
      const arr = [];
      this.sideMenuList.forEach(item => {
        let flag = false;
        this.applicationData.configuration.forEach(menu => {
          if (menu.page === item.page) {
            flag = true;
            console.log(menu);
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            arr.push(item);
          }
        });
        if (!flag) {
          arr.push(item);
        }
      });
      console.log(arr);
      this.applicationData.configuration = [...arr];
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));

  }
  // onChangeOfVisibilityCheckbox(index) {
  //   alert('here');
  //   this.applicationData.configuration[index].visible = !this.applicationData.configuration[index].visible;
  // }

  setActiveTab(type) {
    this.activeTab = type;
  }

  onSaveMenuSettings() {
    this.saveMenuSettingAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.sideMenuList.forEach(item => {
      this.applicationData.configuration.forEach(config => {
        if (item.system_name === config.system_name) {
          item.display_name = config.display_name;
          item.visible = config.visible;
        }
      });
    });
    this.applicationData.configuration = [...this.sideMenuList];
    this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
        this.applicationService.refreshAppData.emit();
        this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
      }
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }


}
