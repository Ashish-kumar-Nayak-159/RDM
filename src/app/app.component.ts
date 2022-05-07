import { CONSTANTS } from 'src/app/constants/app.constants';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, NavigationCancel, NavigationError, NavigationStart } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';

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

  constructor(
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) {

  
  }

  ngOnInit(): void {
  
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
    if (event instanceof NavigationStart) {
      this.showLoader = true;
    }
    if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
      setTimeout(() => (this.showLoader = false), 500);
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
