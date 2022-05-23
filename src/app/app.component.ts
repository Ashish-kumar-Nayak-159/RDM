import { CONSTANTS } from 'src/app/constants/app.constants';
import { fromEvent, Observable, Subscription, merge, of } from 'rxjs';
import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationCancel, NavigationError, NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'RDM';
  isLoginRoute = false;
  isHomeRoute = false;
  userData: any;
  url: any;
  applicationData: any;
  showLoader = true;
  signalRAlertSubscription: Subscription;
  apiSubscriptions: Subscription[] = [];
  onlineEvent: Observable<Event>;
  offlineEvent: Observable<Event>;
  subscriptions: Subscription[] = [];
  connectionStatusMessage: string;
  connectionStatus:string;
  thumbnail: any;

 


  constructor(
    private router: Router,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');
  }

  ngOnInit(): void {
    var online = navigator.onLine;
    if(online == false){
      this.connectionStatus = 'offline';
    }else{
      this.connectionStatus = 'online'
    }
    this.onlineEvent = fromEvent(window, 'online');
    this.offlineEvent = fromEvent(window, 'offline');
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.applicationData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.url = this.router.url;
    this.apiSubscriptions.push(
      this.router.events.subscribe(async (event) => {
        this.navigationInterceptor(event);
        if (event instanceof NavigationEnd) {
          this.url = event.url;
         if (event.url.includes('login')) {
            this.isLoginRoute = true;
            this.isHomeRoute = false;
            if (!this.document.body.classList.contains('bg-white')) {
              this.document.body.classList.add('bg-white');
            }
            if ($('#routeWrapperDiv').hasClass('sb-notoggle')) {
              $('#routeWrapperDiv').removeClass('sb-notoggle');
            }
          } else if (event.url === '/') {
            this.isHomeRoute = true;
            this.isLoginRoute = false;
          } else if (event.url.includes('applications/selection')) {
            this.isHomeRoute = false;
            this.isLoginRoute = true;
            if ($('#routeWrapperDiv').hasClass('sb-notoggle')) {
              $('#routeWrapperDiv').removeClass('sb-notoggle');
            }
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
            }, 700);
          }
        }
      })
    );
  }


  navigationInterceptor(event): void {
    var online = navigator.onLine;
    if(online == false){
      this.connectionStatus = 'offline';
    }else{
      this.connectionStatus = 'online'
    }
    this.subscriptions.push(this.onlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Back to online';
      this.connectionStatus = 'online';
      if(this.isHomeRoute === false){
        if ($('#routeWrapperDiv').removeClass('sb-notoggle')) {
        }
      }else if(this.isLoginRoute === true){
        if ($('#routeWrapperDiv').addClass('sb-notoggle')) {
        }
      }else{
        if ($('#routeWrapperDiv').removeClass('sb-notoggle')) {
        }
      }
      // if(this.isLoginRoute || this.isHomeRoute){
      //   if ($('#routeWrapperDiv').addClass('sb-notoggle')) {
      //   }
      // }else{
      //   if ($('#routeWrapperDiv').removeClass('s-notoggle')) {
      //   }
      // }
    }));

    this.subscriptions.push(this.offlineEvent.subscribe(e => {
      this.connectionStatusMessage = 'Connection lost! You are not connected to internet';
      this.connectionStatus = 'offline';
    }));
    if (event instanceof NavigationStart && this.connectionStatus == 'online') {
      this.showLoader = true;
    }
    if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError || this.connectionStatus == 'online') {
      setTimeout(() => (this.showLoader = false), 300);
    }
  }


  
  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions.forEach(subscription => subscription.unsubscribe());


  }
}
