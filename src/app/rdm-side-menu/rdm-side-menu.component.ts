import { ToasterService } from './../services/toaster.service';
import { SignalRService } from './../services/signalR/signal-r.service';
import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css'],
})
export class RDMSideMenuComponent implements OnInit, OnChanges, OnDestroy {
  userData: any;
  constantsData = CONSTANTS;
  contextApp: any;
  displayMenuList = [];
  signalRAlertSubscription: any;
  apiSubscriptions: Subscription[] = [];
  activeFragment: any;
  currentURL: string;
  criticalToaster: boolean = false;
  errorToaster: boolean = false;
  warningToaster: boolean = false;
  informationalToaster: boolean = false;
  criticalFlag: boolean = false;
  errorFlag: boolean = false;
  warningFlag: boolean = false;
  informationalFlag: boolean = false;
  c_message: any;
  e_message: any;
  w_message: any;
  i_message: any;
  c_message_asset_display_name: any;
  e_message_asset_display_name: any;
  w_message_asset_display_name: any;
  i_message_asset_display_name: any;
  c_message_asset_id: any;
  e_message_asset_id: any;
  w_message_asset_id: any;
  i_message_asset_id: any;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    public route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp && !this.userData?.is_super_admin) {
      this.connectToSignalR();
      this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe((msg) => {

        if ((!msg.type || msg.type === 'alert' && msg?.severity?.toLowerCase() === 'critical')) {
          this.toasterService.showCriticalAlert(
            msg.message,
            msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
            'toast-bottom-right',
            60000
          );
        }
        if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
          this.toasterService.showWarningAlert(
            msg.message,
            msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
            'toast-bottom-right',
            60000
          );
        }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'critical') {
        //   this.c_message = msg?.message
        //   this.c_message_asset_display_name = msg?.asset_display_name
        //   this.c_message_asset_id = msg?.asset_id
        //    this.criticalToaster = true
        //    this.criticalFlag = true
        //    setTimeout(()=>{
        //     this.criticalToaster = false;
        //   },20000)
        // }

        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'error') {
        //   this.e_message = msg?.message
        //   this.e_message_asset_display_name = msg?.asset_display_name
        //   this.e_message_asset_id = msg?.asset_id
        //   this.errorToaster = true
        //   this.errorFlag = true
        //   setTimeout(()=>{
        //     this.errorToaster = false;
        //   },20000)
        // }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
        //   this.w_message = msg?.message
        //   this.w_message_asset_display_name = msg?.asset_display_name
        //   this.w_message_asset_id = msg?.asset_id
        //   this.warningToaster = true
        //   this.warningFlag = true
        //   setTimeout(()=>{
        //     this.warningToaster = false;
        //   },20000)
        // }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'informational') {
        //   this.i_message = msg?.message
        //   this.i_message_asset_display_name = msg?.asset_display_name
        //   this.i_message_asset_id = msg?.asset_id
        //   this.informationalToaster = true
        //   this.informationalFlag = true
        //   setTimeout(()=>{
        //     this.informationalToaster = false;
        //   },20000)
        // }
      });
    }
    this.processAppMenuData();
    this.apiSubscriptions.push(
      this.commonService.refreshSideMenuData.subscribe((list) => {
        let config =
          list.menu_settings?.main_menu?.length > 0
            ? list.menu_settings.main_menu
            : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
        config = JSON.parse(JSON.stringify(config));
        this.processSideMenuData(config, list);
      })
    );
  }

  processAppMenuData() {
    if (this.contextApp?.app) {
      if (!this.userData?.is_super_admin) {
        let data = [];
        const arr = JSON.parse(JSON.stringify(this.constantsData.SIDE_MENU_LIST));
        if (this.contextApp.menu_settings?.main_menu?.length > 0) {
          arr.forEach((config) => {
            let found = false;
            this.contextApp.menu_settings.main_menu.forEach((item) => {
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
        } else {
          data = arr;
        }
        data = data.sort((a, b) => a.index - b.index);

        this.processSideMenuData(data, this.contextApp);
      }
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.userData) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp) {
        // alert('here');
        this.connectToSignalR();
        this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe((msg) => {
          if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'critical') {
            this.toasterService.showCriticalAlert(
              msg.message,
              msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
              'toast-bottom-right',
              60000
            );
          }
          if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
            this.toasterService.showWarningAlert(
              msg.message,
              msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
              'toast-bottom-right',
              60000
            );
          }
        });
        this.processAppMenuData();
      }
    }
  }

  connectToSignalR() {
    this.signalRAlertSubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('overlay');
    const obj = {
      levels: this.contextApp.hierarchy.levels,
      hierarchy: this.contextApp.user.hierarchy,
      type: 'alert',
      app: this.contextApp.app,
    };
    this.signalRService.connectToSignalR(obj, 'overlay');
  }

  processSideMenuData(data, list) {
    const arr = JSON.parse(JSON.stringify(data));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    const decodedToken = this.commonService.decodeJWTToken(token);
    const appData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    arr.forEach((element1) => {
      if (element1?.visible) {
        let trueCount = 0;
        let falseCount = 0;
        element1?.privileges_required?.forEach((privilege) => {
          if (decodedToken?.privileges?.indexOf(privilege) !== -1) {
            if (element1?.page === 'Maintenance') {
              if (appData?.metadata?.maintenance_module)
                trueCount++;
              else
                falseCount++;
            } else {
              trueCount++;
            }
          } else {
            falseCount++;
          }
        });
        if (trueCount > 0) {
          element1.visible = true;
        } else {
          if (falseCount > 0) {
            element1.visible = false;
          }
        }
      }
    });
    this.displayMenuList = JSON.parse(JSON.stringify(arr));
  }

  getURL(url) {
    return url ? url.replace(':appName', this.decode(this.contextApp.app)) : url;
  }

  decode(item) {
    return decodeURIComponent(item);
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
    this.signalRService.disconnectFromSignalR('overlay');
    this.signalRAlertSubscription?.unsubscribe();
  }
}
