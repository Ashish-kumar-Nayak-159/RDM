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
  styleUrls: ['./application-setting.component.css']
})
export class ApplicationSettingComponent implements OnInit, OnDestroy {

  applicationData: any;
  activeTab: string;
  contextApp: any;
  userData: any;
  isApplicationDataLoading = false;
  apiSubscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getApplicationData();
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          }
        ]
      });
    }));
    this.apiSubscriptions.push(this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          this.activeTab = 'meta-data';
        }
      }
    ));

    this.apiSubscriptions.push(this.applicationService.refreshAppData.subscribe(() => {
      this.getApplicationData();
    }));
  }

  getApplicationData() {
    this.isApplicationDataLoading = true;
    this.applicationData = undefined;
    this.apiSubscriptions.push(this.applicationService.getApplicationDetail(this.contextApp.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.user = this.contextApp.user;
          this.applicationData.app = this.contextApp.app;
          this.isApplicationDataLoading = false;
          if (!this.applicationData.configuration) {
            this.applicationData.configuration  = {
              device_control_panel_menu: [],
              legacy_device_control_panel_menu: [],
              gateway_control_panel_menu : [],
              model_control_panel_menu: [],
              main_menu: []
            };
          }
          if (this.applicationData?.configuration?.device_control_panel_menu?.length === 0) {
            this.applicationData.configuration.device_control_panel_menu = CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData?.configuration?.legacy_device_control_panel_menu?.length === 0) {
            this.applicationData.configuration.legacy_device_control_panel_menu = CONSTANTS.LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData?.configuration?.gateway_control_panel_menu?.length === 0) {
            this.applicationData.configuration.gateway_control_panel_menu = CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData?.configuration?.model_control_panel_menu?.length === 0) {
            this.applicationData.configuration.model_control_panel_menu = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
          }
          if (this.applicationData.configuration?.main_menu?.length === 0) {
            this.applicationData.configuration.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          }
          this.commonService.refreshSideMenuData.emit(this.applicationData);
          this.contextApp = JSON.parse(JSON.stringify(this.applicationData));
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.contextApp);
      }, error => this.isApplicationDataLoading = false
    ));
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
