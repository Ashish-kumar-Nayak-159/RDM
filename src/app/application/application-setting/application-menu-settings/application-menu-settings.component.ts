import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';

@Component({
  selector: 'app-application-menu-settings',
  templateUrl: './application-menu-settings.component.html',
  styleUrls: ['./application-menu-settings.component.css'],
})
export class ApplicationMenuSettingsComponent implements OnInit, OnDestroy {
  @Input() applicationData: any;
  saveMenuSettingAPILoading = false;
  originalApplicationData: any;
  sideMenuList = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
  activeTab = 'main-menu';
  toggleRows: any = {};
  apiSubscriptions: Subscription[] = [];
  isAppSettingsEditable = false;
  decodedToken: any;
  constructor(
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.applicationData = JSON.parse(JSON.stringify(this.applicationData));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    // this.applicationData.menu_settings = {};
    if (this.applicationData?.menu_settings?.asset_control_panel_menu?.length === 0) {
      this.applicationData.menu_settings.asset_control_panel_menu = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST.forEach((item) => {
        let flag = false;
        this.applicationData.menu_settings.asset_control_panel_menu.forEach((menu) => {
          if (menu.system_name === item.system_name) {
            flag = true;
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            arr.push(item);
          }
        });
        if (!flag) {
          arr.push(item);
        }
      });
      this.applicationData.menu_settings.asset_control_panel_menu = [...arr];
    }
    if (this.applicationData?.menu_settings?.legacy_asset_control_panel_menu?.length === 0) {
      this.applicationData.menu_settings.legacy_asset_control_panel_menu =
        CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST.forEach((item) => {
        let flag = false;
        this.applicationData.menu_settings.legacy_asset_control_panel_menu.forEach((menu) => {
          if (menu.system_name === item.system_name) {
            flag = true;
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
      this.applicationData.menu_settings.legacy_asset_control_panel_menu = [...arr];
    }
    if (this.applicationData?.menu_settings?.gateway_control_panel_menu?.length === 0) {
      this.applicationData.menu_settings.gateway_control_panel_menu = CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST.forEach((item) => {
        let flag = false;
        if (!this.applicationData.menu_settings.gateway_control_panel_menu) {
          this.applicationData.menu_settings.gateway_control_panel_menu = [];
        }
        this.applicationData.menu_settings.gateway_control_panel_menu.forEach((menu) => {
          if (menu.system_name === item.system_name) {
            flag = true;
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            arr.push(item);
          }
        });
        if (!flag) {
          arr.push(item);
        }
      });
      this.applicationData.menu_settings.gateway_control_panel_menu = [...arr];
    }
    if (this.applicationData?.menu_settings?.model_control_panel_menu?.length === 0) {
      this.applicationData.menu_settings.model_control_panel_menu = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
    } else {
      const arr = [];
      CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST.forEach((item) => {
        let flag = false;
        this.applicationData.menu_settings.model_control_panel_menu.forEach((menu) => {
          if (menu.system_name === item.system_name) {
            flag = true;
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            arr.push(item);
          }
        });
        if (!flag) {
          arr.push(item);
        }
      });
      this.applicationData.menu_settings.model_control_panel_menu = [...arr];
    }
    if (this.applicationData.menu_settings?.main_menu?.length === 0) {
      this.applicationData.menu_settings.main_menu = this.sideMenuList;
    } else {
      const arr = [];
      this.sideMenuList.forEach((item) => {
        let flag = false;
        this.applicationData.menu_settings.main_menu.forEach((menu) => {
          if (menu.page === item.page) {
            flag = true;
            item.display_name = menu.display_name;
            item.visible = menu.visible;
            let aFlag = false;
            item.showAccordion?.forEach((aItem) => {
              menu.showAccordion?.forEach((mItem) => {
                if (aItem.name === mItem.name) {
                  aFlag = true;
                  aItem.value = mItem.value;
                }
              });
            });
            arr.push(item);
          }
          arr.forEach((element1) => {
            if (menu.visible) {
              let trueCount = 0;
              let falseCount = 0;
              const token1 = localStorage.getItem(CONSTANTS.APP_TOKEN);
              const decodedToken = this.commonService.decodeJWTToken(token1);
              element1?.privileges_required?.forEach((privilege) => {
                if (decodedToken?.privileges?.indexOf(privilege) !== -1) {
                  trueCount++;
                } else {
                  falseCount++;
                }
              });
              if (trueCount > 0) {
                element1.privilege_show = true;
              } else {
                if (falseCount > 0) {
                  element1.privilege_show = false;
                }
              }
            }
          });
        });
        if (!flag) {
          arr.push(item);
        }
      });
      this.applicationData.menu_settings.main_menu = [...arr];
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }
  // onChangeOfVisibilityCheckbox(index) {
  //   alert('here');
  //   this.applicationData.menu_settings[index].visible = !this.applicationData.menu_settings[index].visible;
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
    this.sideMenuList.forEach((item) => {
      this.applicationData.menu_settings.main_menu.forEach((config) => {
        if (item.system_name === config.system_name) {
          item.display_name = config.display_name;
          item.visible = config.visible;
        }
      });
    });
    this.applicationData.menu_settings.main_menu = [...this.sideMenuList];
    this.apiSubscriptions.push(
      this.applicationService.updateApp(this.applicationData).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Save Menu Settings');
          this.saveMenuSettingAPILoading = false;
          this.applicationService.refreshAppData.emit();
          this.commonService.refreshSideMenuData.emit(this.applicationData);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Save Menu Settings');
          this.saveMenuSettingAPILoading = false;
        }
      )
    );
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isAppSettingsEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
