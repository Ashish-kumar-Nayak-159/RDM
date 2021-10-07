import { filter } from 'rxjs/operators';
import { CONSTANTS } from './../../app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-application-setting',
  templateUrl: './application-setting.component.html',
  styleUrls: ['./application-setting.component.css'],
})
export class ApplicationSettingComponent implements OnInit, OnDestroy {
  applicationData: any;
  activeTab: string;
  contextApp: any;
  userData: any;
  isApplicationDataLoading = false;
  apiSubscriptions: Subscription[] = [];
  decodedToken: any;
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getApplicationData();
    this.apiSubscriptions.push(
      this.route.fragment.subscribe((fragment) => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          this.activeTab = 'meta-data';
        }
      })
    );
    this.apiSubscriptions.push(
      this.applicationService.refreshAppData.subscribe(() => {
        this.getApplicationData();
      })
    );
  }

  responsiveTabs() {
    if (!$('.responsive-tabs').hasClass('open')) {
      $('.responsive-tabs').addClass('open');
    } else {
      $('.responsive-tabs').removeClass('open');
    }
  }

  getApplicationData() {
    this.isApplicationDataLoading = true;
    this.applicationData = undefined;
    this.apiSubscriptions.push(
      this.applicationService.getApplicationDetail(this.contextApp.app).subscribe(
        (response: any) => {
          this.applicationData = response;
          this.applicationData.user = this.contextApp.user;
          this.applicationData.app = this.contextApp.app;
          this.isApplicationDataLoading = false;
          if (!this.applicationData.menu_settings) {
            this.applicationData.menu_settings = {
              asset_control_panel_menu: [],
              legacy_asset_control_panel_menu: [],
              gateway_control_panel_menu: [],
              model_control_panel_menu: [],
              main_menu: [],
            };
          }
          if (this.applicationData?.menu_settings?.asset_control_panel_menu?.length === 0) {
            this.applicationData.menu_settings.asset_control_panel_menu = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData?.menu_settings?.legacy_asset_control_panel_menu?.length === 0) {
            console.log('in igf');
            this.applicationData.menu_settings.legacy_asset_control_panel_menu =
              CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
            console.log(this.applicationData?.menu_settings?.legacy_asset_control_panel_menu.length);
          }
          if (this.applicationData?.menu_settings?.gateway_control_panel_menu?.length === 0) {
            this.applicationData.menu_settings.gateway_control_panel_menu =
              CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData?.menu_settings?.model_control_panel_menu?.length === 0) {
            this.applicationData.menu_settings.model_control_panel_menu = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData.menu_settings?.main_menu?.length === 0) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          }
          this.contextApp = JSON.parse(JSON.stringify(this.applicationData));
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.contextApp);
          this.commonService.refreshSideMenuData.emit(this.applicationData);
        },
        (error) => (this.isApplicationDataLoading = false)
      )
    );
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
