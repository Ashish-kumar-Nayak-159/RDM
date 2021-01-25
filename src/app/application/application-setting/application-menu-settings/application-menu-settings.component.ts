import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-menu-settings',
  templateUrl: './application-menu-settings.component.html',
  styleUrls: ['./application-menu-settings.component.css']
})
export class ApplicationMenuSettingsComponent implements OnInit, OnDestroy {

  @Input() applicationData: any;
  saveMenuSettingAPILoading = false;
  originalApplicationData: any;
  sideMenuList = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
  activeTab = 'main-menu';
  toggleRows: any = {};
  apiSubscriptions: Subscription[] = [];
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    // this.applicationData.configuration = {};
    if (this.applicationData?.configuration?.device_control_panel_menu?.length === 0) {
      this.applicationData.configuration.device_control_panel_menu = CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST.forEach(item => {
        let flag = false;
        this.applicationData.configuration.device_control_panel_menu.forEach(menu => {
          if (menu.system_name === item.system_name) {
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
      this.applicationData.configuration.device_control_panel_menu = [...arr];
    }
    if (this.applicationData?.configuration?.gateway_control_panel_menu?.length === 0) {
      this.applicationData.configuration.gateway_control_panel_menu = CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST.forEach(item => {
        let flag = false;
        if (!this.applicationData.configuration.gateway_control_panel_menu) {
          this.applicationData.configuration.gateway_control_panel_menu = [];
        }
        this.applicationData.configuration.gateway_control_panel_menu.forEach(menu => {
          if (menu.system_name === item.system_name) {
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
      this.applicationData.configuration.gateway_control_panel_menu = [...arr];
    }
    if (this.applicationData?.configuration?.model_control_panel_menu?.length === 0) {
      this.applicationData.configuration.model_control_panel_menu = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST.forEach(item => {
        let flag = false;
        this.applicationData.configuration.model_control_panel_menu.forEach(menu => {
          if (menu.system_name === item.system_name) {
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
      this.applicationData.configuration.model_control_panel_menu = [...arr];
    }
    if (this.applicationData.configuration?.main_menu?.length === 0) {
      this.applicationData.configuration.main_menu = this.sideMenuList;
    } else {
      const arr = [];
      this.sideMenuList.forEach(item => {
        let flag = false;
        this.applicationData.configuration.main_menu.forEach(menu => {
          if (menu.page === item.page) {
            flag = true;
            console.log(menu);
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            item.showAccordion = menu.showAccordion;
            arr.push(item);
          }
        });
        if (!flag) {
          arr.push(item);
        }
      });
      console.log(arr);
      this.applicationData.configuration.main_menu = [...arr];
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));

  }
  // onChangeOfVisibilityCheckbox(index) {
  //   alert('here');
  //   this.applicationData.configuration[index].visible = !this.applicationData.configuration[index].visible;
  // }

  onToggleRows(i) {
    if (this.toggleRows[i]) {
      this.toggleRows = {};
    } else {
      this.toggleRows = {};
      this.toggleRows[i] = true;
    }
  }

  setActiveTab(type) {
    this.activeTab = type;
  }

  onSaveMenuSettings() {
    this.saveMenuSettingAPILoading = true;
    this.applicationData.id = this.applicationData.app;
    this.sideMenuList.forEach(item => {
      this.applicationData.configuration.main_menu.forEach(config => {
        if (item.system_name === config.system_name) {
          item.display_name = config.display_name;
          item.visible = config.visible;
        }
      });
    });
    this.applicationData.configuration.main_menu = [...this.sideMenuList];
    console.log(JSON.stringify(this.applicationData.configuration));
    this.apiSubscriptions.push(this.applicationService.updateApp(this.applicationData).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
        this.applicationService.refreshAppData.emit();
        this.commonService.refreshSideMenuData.emit(this.applicationData);
      }, (error) => {
        this.toasterService.showError(error.message, 'Save Menu Settings');
        this.saveMenuSettingAPILoading = false;
      }
    ));
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }


}
