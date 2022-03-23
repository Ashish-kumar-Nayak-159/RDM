import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { environment } from './../../environments/environment';
import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
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
  decodedToken: any;
  isGuestUser: string;
  uiMessages = UIMESSAGES.MESSAGES;
  constructor(private router: Router, private commonService: CommonService) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.isGuestUser = localStorage.getItem(CONSTANTS.GUEST_USER);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (this.contextApp && this.userData) {
      if (this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url: CONSTANTS.DEFAULT_HEADER_LOGO,
        };
      }
    }
    this.apiSubscriptions.push(
      this.commonService.refreshSideMenuData.subscribe((list) => {
        this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
        if (this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
          this.contextApp.metadata.header_logo = {
            url: CONSTANTS.DEFAULT_HEADER_LOGO,
          };
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.isGuestUser = localStorage.getItem(CONSTANTS.GUEST_USER);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    if (changes && this.userData) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp && this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url: CONSTANTS.DEFAULT_HEADER_LOGO,
        };
      }
    }
  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    if ($(window).width() > 992 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-toggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }
    if ($(window).width() > 992 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-toggle');
      $('.container-fluid').addClass('sb-notoggle');
    }
    if ($(window).width() > 480 && $(window).width() < 992 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if ($(window).width() > 480 && $(window).width() < 992 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-toggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }
    if ($(window).width() < 480 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-collapse');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if ($(window).width() < 480 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').addClass('sb-toggle');
    }
  }

  openLogoutModal() {
    $('#logoutModal').modal({
      backdrop: 'static',
      keyboard: false,
    });
  }

  openChangePasswordModal() {
    this.isResetPassword = true;
  }

  redirectToFirstMenu() {
    const menu =
      this.contextApp.menu_settings.main_menu.length > 0
        ? this.contextApp.menu_settings.main_menu
        : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
    let i = 0;
    menu.forEach((menuObj) => {
      if (i === 0 && menuObj.visible) {
        i++;
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.contextApp.app);
          this.router.navigateByUrl(menuObj.url);
        }
      }
    });
  }

  onModalClose() {
    this.isResetPassword = false;
  }

  onLogout() {
    $('#logoutModal').modal('hide');
    this.commonService.onLogOut();
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
