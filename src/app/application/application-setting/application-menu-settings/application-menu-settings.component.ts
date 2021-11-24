import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { ApplicationService } from 'src/app/services/application/application.service';
declare var $: any;
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
      this.sideMenuList.forEach((menu, i) => {
        if (menu.index === undefined || menu.index === null) {
          menu.index = i;
        }
      });
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
            item.index = menu.index;
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
      this.applicationData.menu_settings.main_menu.forEach((menu, i) => {
        if (menu.index === undefined || menu.index === null) {
          menu.index = i;
        }
      });
      this.applicationData.menu_settings.main_menu = this.applicationData.menu_settings.main_menu.sort(
        (a, b) => a.index - b.index
      );
    }
    this.originalApplicationData = JSON.parse(JSON.stringify(this.applicationData));
  }
  // onChangeOfVisibilityCheckbox(index) {
  //   alert('here');
  //   this.applicationData.menu_settings[index].visible = !this.applicationData.menu_settings[index].visible;
  // }

  openReorderMainMenuModal() {
    $('#reorderMainMenuModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.getTableSortable();
  }

  reorderMainMenu() {
    this.applicationData.menu_settings.main_menu = this.applicationData.menu_settings.main_menu.sort(
      (a, b) => a.index - b.index
    );
    this.sideMenuList = this.sideMenuList.sort(
      (a, b) =>
        a.index -
        b.index
    );
    this.onSaveMenuSettings();
    this.closeModal();
  }

  closeModal() {
    $('#reorderMainMenuModal').modal('hide');
    $('#myFavTable tbody').sortable('destroy');
  }
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
    this.sideMenuList = this.sideMenuList.sort(
      (a, b) =>
        a.index -
        b.index
    );
    this.applicationData.menu_settings.main_menu = [...this.sideMenuList];
    console.log(JSON.stringify(this.applicationData.menu_settings.main_menu));
    console.log(this.sideMenuList);
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

  getTableSortable() {
    const that = this;
    setTimeout(() => {
      const fixHelperModified = (e, tr) => {
        console.log(tr);

        const $originals = tr.children();
        const $helper = tr.clone();
        $helper.children().each(function (index) {
          $(this).width($originals.eq(index).width());
        });

        return $helper;
      };

      const updateIndex = (e, ui) => {
        $('td.index', ui.item.parent()).each(function (i) {
          $(this).html((i + 1) + '');
        });
        console.log(ui.item.next());
        $('tr.favoriteOrderId', ui.item.parent()).each(function (i) {
          // tslint:disable-next-line: prefer-for-of
          for (let j = 0; j < that.applicationData.menu_settings.main_menu.length; j++) {
            if ($(this).attr('id') === that.applicationData.menu_settings.main_menu[j].system_name) {
              // if (
              //   this.toggleRows &&
              //   this.toggleRows['main_menu_' + that.applicationData.menu_settings.main_menu[j].index]
              // ) {
              //   this.toggleRows['main_menu_' + i] =
              //     this.toggleRows['main_menu_' + that.applicationData.menu_settings.main_menu[j].index];
              //   delete this.toggleRows['main_menu_' + that.applicationData.menu_settings.main_menu[j].index];
              // }
              that.applicationData.menu_settings.main_menu[j].index = i;
            }
          }
        });
      };

      $('#myFavTable tbody')
        .sortable({
          helper: fixHelperModified,
          stop: updateIndex,
        })
        .disableSelection();

      $('#myFavTable tbody').sortable({
        distance: 5,
        delay: 100,
        opacity: 0.6,
        cursor: 'move',
        update: () => {},
      });
    }, 100);
  }

  onCancelClick() {
    this.applicationData = JSON.parse(JSON.stringify(this.originalApplicationData));
    this.isAppSettingsEditable = false;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
