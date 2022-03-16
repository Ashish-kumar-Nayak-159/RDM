import { SignalRService } from './../../services/signalR/signal-r.service';
import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { AssetService } from 'src/app/services/assets/asset.service';

@Component({
  selector: 'app-application-selection',
  templateUrl: './application-selection.component.html',
  styleUrls: ['./application-selection.component.css'],
})
export class ApplicationSelectionComponent implements OnInit, OnDestroy {
  userData: any;
  constantData = CONSTANTS;
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  applicationData: any;
  apiSubscriptions: Subscription[] = [];
  isAppDataLoading;
  decodedToken: any;
  userApplications: any[] = [];
  isUserApplicationLoading = false;
  uiMessages = UIMESSAGES.MESSAGES;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    private assetService:AssetService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    const appToken = localStorage.getItem(CONSTANTS.APP_TOKEN);
    if (appToken) {
      this.getUserApplications();
    } else {
      this.userApplications = this.userData?.apps || [];
    }
  }

  getUserApplications() {
    this.isUserApplicationLoading = true;
    this.userApplications = [];
    const obj = {
      environment: environment.environment,
    };
    this.applicationService.getApplicationOfUser(obj).subscribe((response: any) => {
      if (response?.data) {
        response.data.forEach((app) => {
          const decodedToken = this.commonService.decodeJWTToken(app.token);
          const obj = {
            hierarchy: decodedToken.hierarchy,
            role: decodedToken.role,
            privileges: decodedToken.privileges,
          };
          app.user = obj;
        });
        this.userData.apps = response.data;
        this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);
      }
      if (this.userData.apps.length === 0) {
        this.toasterService.showError(this.uiMessages.NO_APPS_ASSIGNED_MESSAGE, this.uiMessages.CONTACT_ADMINISTRATOR);
        this.commonService.onLogOut();
      }
      this.isUserApplicationLoading = false;
    });
  }

  async redirectToApp(app, index) {    
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
    this.signalRService.disconnectFromSignalR('all');
    const localStorageAppData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.isAppDataLoading = {};
    this.isAppDataLoading[index] = true;
    if (localStorageAppData && localStorageAppData.app !== app.app) {
      localStorage.removeItem(CONSTANTS.SELECTED_APP_DATA);
      localStorage.removeItem(CONSTANTS.ASSETS_LIST);
      localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
      localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
      localStorage.removeItem(CONSTANTS.APP_USERS);
      localStorage.removeItem(CONSTANTS.ASSETS_GATEWAYS_LIST);
      localStorage.removeItem(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
      localStorage.removeItem(CONSTANTS.MAIN_MENU_FILTERS);
      localStorage.removeItem(CONSTANTS.APP_TOKEN);
    }
    localStorage.setItem(CONSTANTS.APP_TOKEN, app.token);
    await this.getApplicationData(app);
    console.log('this.applicationData.menu_settings ',this.applicationData.menu_settings);
    
    this.commonService.refreshSideMenuData.emit(this.applicationData);
    
    // this.router.navigate(['applications', this.applicationData.app]);
    this.redirectToFirstMenu()
    this.isAppDataLoading = undefined;
  }

  redirectToFirstMenu() {
    const menu =
      this.applicationData.menu_settings.main_menu.length > 0
        ? this.applicationData.menu_settings.main_menu
        : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
    for(let i=0;i<menu.length;i++){
      const menuObj = menu[i];
      if (menuObj.visible) {
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.applicationData.app);
          this.router.navigateByUrl(menuObj.url);
        }
        break;
      }

    }
  }

  getApplicationData(app) {
    return new Promise<void>((resolve) => {
      this.applicationData = undefined;
      this.apiSubscriptions.push(
        this.applicationService.getApplicationDetail(app.app, true).subscribe((response: any) => {
          console.log('response ',response);
          
          this.applicationData = JSON.parse(JSON.stringify(response));
          console.log('this.applicationData ',this.applicationData);
          
          this.applicationData.app = app.app;

          this.userData.apps.forEach((appObj) => {
            if (app.app === appObj.app) {
              this.applicationData.user = appObj.user;
            }
          });
          
          if (
            !this.applicationData.menu_settings.main_menu ||
            this.applicationData.menu_settings.main_menu.length === 0
          ) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (
            !this.applicationData.menu_settings.asset_control_panel_menu ||
            this.applicationData.menu_settings.asset_control_panel_menu.length === 0
          ) {
            this.applicationData.menu_settings.asset_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (
            !this.applicationData.menu_settings.legacy_asset_control_panel_menu ||
            this.applicationData.menu_settings.legacy_asset_control_panel_menu.length === 0
          ) {
            this.applicationData.menu_settings.legacy_asset_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (
            !this.applicationData.menu_settings.model_control_panel_menu ||
            this.applicationData.menu_settings.model_control_panel_menu.length === 0
          ) {
            this.applicationData.menu_settings.model_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (
            !this.applicationData.menu_settings.gateway_control_panel_menu ||
            this.applicationData.menu_settings.gateway_control_panel_menu.length === 0
          ) {
            this.applicationData.menu_settings.gateway_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST)
            );
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          this.applicationService.getExportedHierarchy().subscribe((response: any) => {
            localStorage.removeItem(CONSTANTS.HIERARCHY_TAGS);
            if(response)
            {
              this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response);
            }
          });
          const obj = {
            hierarchy: this.applicationData?.user?.hierarchy,
            dateOption: this.applicationData?.metadata?.filter_settings?.search_duration || 'Last 24 Hours',
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          const obj1 = {
            dateOption: this.applicationData?.metadata?.filter_settings?.search_duration_control_panel ||'Last 30 Mins',
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, obj1);
          localStorage.removeItem(CONSTANTS.ALL_ASSETS_LIST);
          const assetTypesObj = {
            hierarchy: JSON.stringify(this.applicationData.user.hierarchy),
            type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET + ',' + CONSTANTS.IP_GATEWAY,
          };  
          this.apiSubscriptions.push(
            this.assetService.getAndSetAllAssets(assetTypesObj, this.applicationData.app).subscribe((response: any) => {
              resolve();
            })
          );
        })
      );
    });
  }

  processAppMenuData() {
    if (this.applicationData?.app) {
      if (!this.userData?.is_super_admin) {
        const data = [];
        const arr = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
        if (this.applicationData.menu_settings?.main_menu?.length > 0) {
          arr.forEach((config) => {
            let found = false;
            this.applicationData.menu_settings.main_menu.forEach((item) => {
              if (config.page === item.page) {
                found = true;
                config.display_name = item.display_name;
                config.visible = item.visible;
                config.showAccordion = item.showAccordion;
                config.index = item.index;
                data.push(config);
              }
            });
            if (!found) {
              data.push(config);
            }
          });
        }
        this.applicationData.menu_settings.main_menu = data.sort(
          (a, b) =>
            a.index -
            b.index
        );
      }
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
