import { ToasterService } from './../services/toaster.service';
import { SignalRService } from './../services/signalR/signal-r.service';
import { element } from 'protractor';
import { ApplicationService } from 'src/app/services/application/application.service';
import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Subscription } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
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
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService,
    private router: Router,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    public route: ActivatedRoute
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.fragment.subscribe(
      fragment => {
      this.activeFragment = fragment;
      console.log('activeFragment   ', this.activeFragment);
    });

    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    // if (this.userData && !this.userData.is_super_admin) {
    //   this.appName = this.userData.apps[0].app;
    // }
    if (this.contextApp) {
      // alert('here');
      this.connectToSignalR();

      this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe(
        msg => {
          if (msg?.severity?.toLowerCase() === 'critical') {
          this.toasterService.showCriticalAlert(
            msg.message,
            msg.device_display_name ? msg.device_display_name : msg.device_id,
            'toast-bottom-right',
            60000
          );
          }
        }
      );
    }
    this.processAppMenuData();
    let i = 0;
    this.apiSubscriptions.push(this.router.events.subscribe(async event => {
      this.currentURL = this.router.url;
      if (event instanceof NavigationEnd && i === 0) {
        i++;
        this.processAppMenuData();
      }
    }));

    this.apiSubscriptions.push(this.commonService.refreshSideMenuData.subscribe(list => {
      let config = list.configuration?.main_menu?.length > 0 ? list.configuration.main_menu :
      JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
      config = JSON.parse(JSON.stringify(config));
      this.processSideMenuData(config, list);
    }));
  }


  processAppMenuData() {
    if (this.contextApp?.app) {
      if (!this.userData?.is_super_admin) {
      let data = [];
      const arr = JSON.parse(JSON.stringify(this.constantsData.SIDE_MENU_LIST));
      if (this.contextApp.configuration?.main_menu?.length > 0) {
        arr.forEach(config => {
          let found = false;
          this.contextApp.configuration.main_menu.forEach(item => {
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
      } else {
        data =  arr;
      }
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

        this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe(
          msg => {
            if (msg?.severity?.toLowerCase() === 'critical') {
            this.toasterService.showCriticalAlert(
              msg.message,
              msg.device_display_name ? msg.device_display_name : msg.device_id,
              'toast-bottom-right',
              60000
            );
            }
          }
        );
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
      app: this.contextApp.app
    };
    this.signalRService.connectToSignalR(obj, 'overlay');
  }

  processSideMenuData(data, list) {
    // alert('here');
    const arr = JSON.parse(JSON.stringify(data));
    arr.forEach(element1 => {
      if (element1.page === 'Things Models') {
        if (this.contextApp?.user.role !== CONSTANTS.APP_ADMIN_ROLE) {
        element1.visible = false;
        } else {
          element1.visible = true;
        }
      }
    });
    this.displayMenuList = JSON.parse(JSON.stringify(arr));
  }



  getURL(url) {
    // if ($('.sidebar').hasClass('toggled')) {
    //   $('body').removeClass('sidebar-toggled');
    //   $('.sidebar').removeClass('toggled');
    //   $('.sidebar .collapse').collapse('show');
    // }
    return url ? url.replace(':appName', this.decode(this.contextApp.app)) : url;
  }

  decode(item) {
    return decodeURIComponent(item);
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
    this.signalRService.disconnectFromSignalR('overlay');
    this.signalRAlertSubscription?.unsubscribe();
  }

}
