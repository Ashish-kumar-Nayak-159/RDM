import { SignalRService } from './../../services/signalR/signal-r.service';
import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AssetService } from 'src/app/services/assets/asset.service';

@Component({
  selector: 'app-application-selection',
  templateUrl: './application-selection.component.html',
  styleUrls: ['./application-selection.component.css']
})
export class ApplicationSelectionComponent implements OnInit, OnDestroy {

  userData: any;
  constantData = CONSTANTS;
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  applicationData: any;
  apiSubscriptions: Subscription[] = [];
  isAppDataLoading;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private applicationService: ApplicationService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if ($('.container-fluid').hasClass('sb-notoggle')) {
      $('.container-fluid').removeClass('sb-notoggle');
    }
    else if ($('.container-fluid').hasClass('sb-toggle')) {
      $('.container-fluid').removeClass('sb-toggle');
    }

  }

  async redirectToApp(app, index) {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
    this.signalRService.disconnectFromSignalR('all');

    const localStorageAppData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.isAppDataLoading = {};
    this.isAppDataLoading[index] = true;
    if (localStorageAppData && localStorageAppData.app !== app.app)  {
      localStorage.removeItem(CONSTANTS.DASHBOARD_ALERT_SELECTION);
      localStorage.removeItem(CONSTANTS.DASHBOARD_TELEMETRY_SELECTION);
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
    // await this.getAssets(this.applicationData.user.hierarchy);
    // await this.getAssetModels(this.applicationData.user.hierarchy);
    this.commonService.refreshSideMenuData.emit(this.applicationData);
    this.router.navigate(['applications', this.applicationData.app]);
    // const menu = this.applicationData.menu_settings.main_menu.length > 0 ?
    // this.applicationData.menu_settings.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
    // let i = 0;
    // menu.forEach(menuObj => {
    //   if (menuObj.page === 'Things Modelling' && this.applicationData.user.role === CONSTANTS.APP_ADMIN_ROLE) {
    //     menuObj.visible = true;
    //   }
    //   if ( i === 0 && menuObj.visible) {
    //     i++;
    //     let url = menuObj.url;
    //     if (menuObj.url?.includes(':appName')) {
    //       url = menuObj.url.replace(':appName', this.applicationData.app);
    //       console.log('after url   ', url);
    //       this.router.navigateByUrl(url);
    //     }
    //   }
    // });
    // if (i === 0) {
    //   this.toasterService.showError('All the menu items visibility are off. Please contact administrator', 'App Selection');
    // }
    this.isAppDataLoading = undefined;
  }

  getAssets(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET
      };
      this.apiSubscriptions.push(this.assetService.getIPAndLegacyAssets(obj, this.applicationData.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSETS_LIST, response.data);
          }
          resolve();
        }
      ));
    });
  }

  getAssetModels(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        app: this.applicationData.app
      };
      this.apiSubscriptions.push(this.assetModelService.getThingsModelsList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODELS_LIST, response.data);
          }
          resolve();
        }
      ));
    });
  }

  getApplicationData(app) {
    return new Promise<void>((resolve) => {
    this.applicationData = undefined;
    this.apiSubscriptions.push(this.applicationService.getApplicationDetail(app.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          if (!this.applicationData.menu_settings.main_menu || this.applicationData.menu_settings.main_menu.length === 0) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (!this.applicationData.menu_settings.asset_control_panel_menu ||
            this.applicationData.menu_settings.asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.asset_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (!this.applicationData.menu_settings.legacy_asset_control_panel_menu ||
            this.applicationData.menu_settings.legacy_asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.legacy_asset_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.menu_settings.model_control_panel_menu ||
            this.applicationData.menu_settings.model_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.model_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
          }
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


  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
