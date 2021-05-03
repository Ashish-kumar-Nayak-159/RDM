import { SignalRService } from './../../services/signalR/signal-r.service';
import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { DeviceService } from 'src/app/services/devices/device.service';

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
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private signalRService: SignalRService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
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
      localStorage.removeItem(CONSTANTS.DEVICES_LIST);
      localStorage.removeItem(CONSTANTS.DEVICE_MODELS_LIST);
      localStorage.removeItem(CONSTANTS.DEVICE_MODEL_DATA);
      localStorage.removeItem(CONSTANTS.APP_USERS);
      localStorage.removeItem(CONSTANTS.DEVICES_GATEWAYS_LIST);
      localStorage.removeItem(CONSTANTS.DEVICE_LIST_FILTER_FOR_GATEWAY);
    }
    await this.getApplicationData(app);
    // await this.getDevices(this.applicationData.user.hierarchy);
    // await this.getDeviceModels(this.applicationData.user.hierarchy);
    this.commonService.refreshSideMenuData.emit(this.applicationData);
    this.router.navigate(['applications', this.applicationData.app]);
    // const menu = this.applicationData.configuration.main_menu.length > 0 ?
    // this.applicationData.configuration.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
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

  getDevices(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.apiSubscriptions.push(this.deviceService.getIPAndLegacyDevices(obj, this.applicationData.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.commonService.setItemInLocalStorage(CONSTANTS.DEVICES_LIST, response.data);
          }
          resolve();
        }
      ));
    });
  }

  getDeviceModels(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        app: this.applicationData.app
      };
      this.apiSubscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.commonService.setItemInLocalStorage(CONSTANTS.DEVICE_MODELS_LIST, response.data);
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
          if (!this.applicationData.configuration.main_menu || this.applicationData.configuration.main_menu.length === 0) {
            this.applicationData.configuration.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (!this.applicationData.configuration.device_control_panel_menu ||
            this.applicationData.configuration.device_control_panel_menu.length === 0) {
            this.applicationData.configuration.device_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (!this.applicationData.configuration.legacy_device_control_panel_menu ||
            this.applicationData.configuration.legacy_device_control_panel_menu.length === 0) {
            this.applicationData.configuration.legacy_device_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.configuration.model_control_panel_menu ||
            this.applicationData.configuration.model_control_panel_menu.length === 0) {
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


  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
