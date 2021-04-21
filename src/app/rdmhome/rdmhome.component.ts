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
        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 1) {
          this.router.navigate(['applications', 'selection']);
        } else if (this.userData.apps && this.userData.apps.length === 1) {
          await this.getApplicationData(this.userData.apps[0]);
          const menu = this.applicationData.configuration.main_menu.length > 0 ?
          this.applicationData.configuration.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
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
          if (this.applicationData.configuration.main_menu.length === 0) {
            this.applicationData.configuration.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (this.applicationData.configuration.device_control_panel_menu.length === 0) {
            this.applicationData.configuration.device_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.configuration.legacy_device_control_panel_menu.length === 0) {
            this.applicationData.configuration.legacy_device_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.configuration.model_control_panel_menu.length === 0) {
            this.applicationData.configuration.model_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          resolve();
      }));
    });
  }

  processAppMenuData() {
    if (this.applicationData?.app) {
      if (!this.userData?.is_super_admin) {
      const data = [];
      const arr = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
      if (this.applicationData.configuration?.main_menu?.length > 0) {
        arr.forEach(config => {
          let found = false;
          this.applicationData.configuration.main_menu.forEach(item => {
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
      this.applicationData.configuration.main_menu = JSON.parse(JSON.stringify(data));
      }
      }
  }

  ngOnDestroy(): void {
    $('body').css({'overflow-y': ''});
  }

}
