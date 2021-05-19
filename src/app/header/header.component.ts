import { environment } from './../../environments/environment';
import { Component, OnInit, Inject, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
import { CONSTANTS } from '../app.constants';
import { filter } from 'rxjs/operators';
import { data } from 'jquery';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges, OnDestroy {
  breadcrumbData: any[] = [];
  userData: any;
  @Input() url: string;
  @Input() isLoginRoute = false;
  @Input() contextApp: any;
  blobToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  constantData = CONSTANTS;
  isResetPassword = false;
  apiSubscriptions: Subscription[] = [];
  defaultAppName = environment.app;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {

   }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    // this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp && this.userData) {
      if (this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      }
    }
    this.apiSubscriptions.push(this.router.events
    .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
    .subscribe(event => {
      if (
        event.id === 1 &&
        event.url === event.urlAfterRedirects
      ) {
        this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
        this.breadcrumbData = this.commonService.getItemFromLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE);
      }
    }));
    this.apiSubscriptions.push(this.commonService.refreshSideMenuData.subscribe(list => {

      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp?.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      } else if (this.contextApp  && this.contextApp.metadata) {
        this.contextApp.metadata.header_logo = list.metadata.header_logo;
      }
    }));
    this.apiSubscriptions.push(this.commonService.breadcrumbEvent.subscribe((breadcrumbs: any) => {
      this.commonService.setItemInLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE, this.breadcrumbData);
      if (breadcrumbs.type === 'replace') {
        this.breadcrumbData = breadcrumbs.data;
      } else if (breadcrumbs.type === 'append') {
        if (this.breadcrumbData && this.breadcrumbData.length > 0 ) {
          breadcrumbs.data.forEach(item => {
            let isFound = false;
            this.breadcrumbData.forEach(obj => {
              if (obj.url === item.url) {
                isFound = true;
              }
            });
            if (!isFound) {
              this.breadcrumbData.splice(this.breadcrumbData.length, 0, item);
            }
          });
        } else {
          this.breadcrumbData = breadcrumbs.data;
        }
      }
    }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (changes && this.userData) {
      // this.appName = changes.appName.currentValue;
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp && this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      }
    }
  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    // if ($('.sidebar').hasClass('toggled')) {
    //   // $(".sidebar .collapse").collapse("hide");
    //   $('.container-fluid').removeClass('sb-notoggle');
    //   $('.container-fluid').addClass('sb-toggle');
    // }
    // if (!$('.sidebar').hasClass('toggled')) {
    //   // $(".sidebar .collapse").collapse("show");
    //   $('.container-fluid').addClass('sb-notoggle');
    //   $('.container-fluid').removeClass('sb-toggle');
    // }
    if ($('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
      $('.sidebar .collapse').collapse('hide');
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').addClass('sb-toggle');
    } else {
      $('body').removeClass('sidebar-toggled');
      $('.sidebar').removeClass('toggled');
      $('.container-fluid').addClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
  }

  navigateToDashboard(type) {
    if (type === 'telemetry' ) {
    const url = 'applications/' + this.contextApp.app + '/dashboard';
    this.router.navigateByUrl(url);
    } else if (type === 'alert') {
      const url = 'applications/' + this.contextApp.app + '/alerts/visualization';
      this.router.navigateByUrl(url);
    }
  }

  openChangePasswordModal() {
    this.isResetPassword = true;
    // $('#changePasswordModal').modal({
    //   backdrop: 'static',
    //   keyboard: false
    // });
  }

  redirectToFirstMenu() {
    const menu = this.contextApp.configuration.main_menu.length > 0 ?
    this.contextApp.configuration.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
    let i = 0;
    menu.forEach(menuObj => {
      if ( i === 0 && menuObj.visible) {
        i++;
        const url = menuObj.url;
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.contextApp.app);
          this.router.navigateByUrl(menuObj.url);
        }
      }
    });
  }

  onClickOfBreadcrumbItem(obj, index) {
    const arr = JSON.parse(JSON.stringify(this.breadcrumbData));
    for (let i = this.breadcrumbData.length - 1; i >= index; i--) {
      arr.splice(i, 1);
    }

    this.breadcrumbData = JSON.parse(JSON.stringify(arr));
    this.router.navigate([obj.url], {queryParams: (obj.queryParams ? obj.queryParams : undefined)});
  }


  decode(item) {
    return decodeURIComponent(item);
  }

  onModalClose() {
    // alert('here');
    // $('#changePasswordModal').modal('hide');
    this.isResetPassword = false;
  }

  onLogout() {
    $('#logoutModal').modal('hide');
    this.commonService.onLogOut();
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }

}
