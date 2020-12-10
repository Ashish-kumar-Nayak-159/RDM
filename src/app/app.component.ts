import { Subscription } from 'rxjs';
import { ToasterService } from 'src/app/services/toaster.service';
import { Component, Inject, HostListener, NgZone, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './app.constants';
import { ApplicationService } from './services/application/application.service';
import { SignalRService } from './services/signalR/signal-r.service';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'RDM';
  isLoginRoute = false;
  isHomeRoute = false;
  userData: any;
  url: any;
  applicationData: any;
  signalRAlertSubscription: Subscription;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document,
    private applicationService: ApplicationService,
    private toasterService: ToasterService,
    private singalRService: SignalRService
  ) {
  }
  ngAfterViewInit(): void {

    setTimeout(() => {
      if (!this.isLoginRoute && !this.isHomeRoute) {
        const node = document.createElement('script');
        node.src = './assets/js/kdm.min.js';
        node.type = 'text/javascript';
        node.async = false;
        document.getElementsByTagName('head')[0].appendChild(node);
      }
    }, 500);

  }


  ngOnInit(): void {

    // setInterval(() => {
    //   this.toasterService.showCriticalAlert('Critical Alert', 'Pump pressure is high', 'toast-bottom-right', 1000);
    // }, 10000);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.applicationData) {
      // this.connectToSignalR();
      // this.signalRAlertSubscription = this.singalRService.signalRAlertData.subscribe(
      //   msg => {
      //     this.toasterService.showCriticalAlert(
      //       msg.message,
      //       msg.device_display_name ? msg.device_display_name : msg.device_id,
      //       'toast-bottom-right',
      //       1000
      //     );
      //   }
      // );
    }
    this.url = this.router.url;
    this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
        if (!this.applicationData) {
        if (this.userData ) {
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
        if (event.url.includes('login')) {
          this.isLoginRoute = true;
          this.isHomeRoute = false;
          if (!this.document.body.classList.contains('bg-white')) {
            this.document.body.classList.add('bg-white');
          }
        } else if (event.url === '/') {
          this.isHomeRoute = true;
          this.isLoginRoute = false;
        } else if (event.url.includes('applications/selection')) {
          this.isHomeRoute = false;
          this.isLoginRoute = true;
        } else {
          this.isLoginRoute = false;
          this.isHomeRoute = false;
          if (this.document.body.classList.contains('bg-white')) {
            this.document.body.classList.remove('bg-white');
          }
          setTimeout(() => {
            const node = document.createElement('script');
            node.src = './assets/js/kdm.min.js';
            node.type = 'text/javascript';
            node.async = false;
            document.getElementsByTagName('head')[0].appendChild(node);
            }, 500);
        }
        console.log(this.isLoginRoute);
      }
    });

  }

  connectToSignalR() {
    const obj = {
      levels: this.applicationData.hierarchy.levels,
      hierarchy: this.applicationData.user.hierarchy,
      type: 'alert'
    };
    this.singalRService.connectToSignalR(obj);
  }

  getApplicationData(app) {
    return new Promise((resolve) => {
    this.applicationData = undefined;
    this.applicationService.getApplicationDetail(app.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          if (this.applicationData.configuration.main_menu.length === 0) {
            this.applicationData.configuration.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          }
          if (this.applicationData.configuration.device_control_panel_menu.length === 0) {
            this.applicationData.configuration.device_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.configuration.model_control_panel_menu.length === 0) {
            this.applicationData.configuration.model_control_panel_menu =
            JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          resolve();
      });
    });
  }

  ngOnDestroy() {
    this.singalRService.disconnectFromSignalR();
    this.signalRAlertSubscription.unsubscribe();
  }

}
