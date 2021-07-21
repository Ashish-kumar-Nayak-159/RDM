import { environment } from './../../environments/environment';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '../app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-rdmhome',
  templateUrl: './rdmhome.component.html',
  styleUrls: ['./rdmhome.component.css']
})
export class RDMHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  userData: any;
  applicationData: any;
  subscriptions: Subscription[] = [];
  defaultAppName = environment.app;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    console.log(this.userData);
    if (this.userData) {
      if (this.userData.is_super_admin) {
        localStorage.removeItem(CONSTANTS.APP_TOKEN);
        localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.token);
        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 1) {
          this.router.navigate(['applications', 'selection']);
        } else if (this.userData.apps && this.userData.apps.length === 1) {
          localStorage.removeItem(CONSTANTS.APP_TOKEN);
          localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.apps[0].token);
          await this.getApplicationData(this.userData.apps[0]);
          const menu = this.applicationData.menu_settings.main_menu.length > 0 ?
          this.applicationData.menu_settings.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          let i = 0;
          menu.forEach(menuObj => {
            if ( i === 0 && menuObj.visible) {
              i++;
              const url = menuObj.url;
              if (menuObj.url?.includes(':appName')) {
                menuObj.url = menuObj.url.replace(':appName', this.applicationData.app);
                this.router.navigateByUrl(menuObj.url);
              }
            }
          });
        }
      }
    }
  }

  ngAfterViewInit(): void {
    $('body').css({'overflow-y': 'auto'});
    if ($('body').hasClass('sb-notoggle')) {
      $('body').removeClass('sb-notoggle');
    }
    if ($('body').hasClass('sb-toggle')) {
      $('body').removeClass('sb-toggle');
    }
    if ($('#container-fluid-div').hasClass('sb-notoggle')) {
      console.log('in sb-notoggle');
      $('#container-fluid-div').removeClass('sb-notoggle');
    }
  }

  getApplicationData(app) {
    return new Promise((resolve) => {
    this.applicationData = undefined;
    this.subscriptions.push(this.applicationService.getApplicationDetail(app.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          if (this.applicationData.menu_settings.main_menu.length === 0) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (this.applicationData.menu_settings.asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.asset_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.menu_settings.legacy_asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.legacy_asset_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.menu_settings.model_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.model_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          const obj = {
            hierarchy : this.applicationData.user.hierarchy,
            dateOption : 'Last 24 Hours'
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          const obj1 = {
            dateOption : 'Last 30 Mins'
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, obj1);
          resolve();
      }));
    });
  }

  processAppMenuData() {
    if (this.applicationData?.app) {
      if (!this.userData?.is_super_admin) {
      const data = [];
      const arr = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
      if (this.applicationData.menu_settings?.main_menu?.length > 0) {
        arr.forEach(config => {
          let found = false;
          this.applicationData.menu_settings.main_menu.forEach(item => {
            if (config.page === item.page) {
              found = true;
              config.display_name = item.display_name;
              config.visible = item.visible;
              config.showAccordion = item.showAccordion;
              data.push(config);
            }
          });
          if (!found) {
            data.push(config);
          }
        });
      }
      this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(data));
      }
      }
  }

  ngOnDestroy(): void {
    $('body').css({'overflow-y': ''});
  }

}
