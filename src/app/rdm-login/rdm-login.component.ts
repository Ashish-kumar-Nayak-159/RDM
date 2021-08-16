import { APIMESSAGES } from './../api-messages.constants';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/app.constants';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { CommonService } from 'src/app/services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
declare var $: any;
@Component({
  selector: 'app-rdm-login',
  templateUrl: './rdm-login.component.html',
  styleUrls: ['./rdm-login.component.css']
})
export class RDMLoginComponent implements OnInit, AfterViewInit, OnDestroy {

  loginForm: any = {};
  usersList: any[] = [];
  userData: any;
  isResetPassword = false;
  isLoginAPILoading = false;
  applicationData: any;
  subscriptions: Subscription[] = [];
  isPasswordVisible = false;
  isForgotPassword = false;
  isForgotAPILoading = false;
  constructor(
    private router: Router,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
        // this.subscriptions.push(this.commonService.resetPassword.subscribe((resetPassword: boolean) => {
    //   if (!resetPassword) {
    //     // $('#changePasswordModal').modal('hide');
    //     this.loginForm.reset();
    //   }
    // }));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      if (this.userData.is_super_admin) {
        localStorage.removeItem(CONSTANTS.APP_TOKEN);
        console.log(this.userData.token);
        localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.token);
        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 1) {
          this.router.navigate(['applications', 'selection']);
        } else if (this.userData.apps && this.userData.apps.length === 1) {
          localStorage.removeItem(CONSTANTS.APP_TOKEN);
          const decodedToken =  this.commonService.decodeJWTToken(this.userData.apps[0].token);
          if (decodedToken?.privileges.indexOf('APMV') === -1) {
            this.toasterService.showError(APIMESSAGES.API_ACCESS_ERROR_MESSAGE, APIMESSAGES.CONTACT_ADMINISTRATOR);
            this.commonService.onLogOut();
            return;
          }
          localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.apps[0].token);
          await this.getApplicationData(this.userData.apps[0]);
          this.router.navigate(['applications', this.userData.apps[0].app]);
        }
      }
    }

  }

  ngAfterViewInit(): void {
    if ($('body').hasClass('sb-notoggle')) {
      $('body').removeClass('sb-notoggle');
    }
    if ($('body').hasClass('sb-toggle')) {
      $('body').removeClass('sb-toggle');
    }
    if ($('.container-fluid').hasClass('sb-notoggle')) {
      console.log('in sb-notoggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }
  }

  onResetModalClose() {
    this.loginForm.reset();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    if (this.loginForm.email && this.loginForm.password) {
      this.isLoginAPILoading = true;
      const app = environment.app;
      if (app) {
        this.loginForm.app = app;
      }
      const env = environment.environment;
      if (env) {
        this.loginForm.environment = env;
      }
      this.subscriptions.push(this.commonService.loginUser(this.loginForm).subscribe(
        async (response: any) => {
          this.userData = response;
          // const expiryObj = this.commonService.getItemFromLocalStorage(CONSTANTS.EXPIRY_TIME);
          // if (!expiryObj || expiryObj.email !== this.userData.email || new Date().getTime() > expiryObj.expired_at) {
          //   localStorage.clear();
          // }
          localStorage.setItem(CONSTANTS.APP_VERSION, environment.version);
          if (response.is_super_admin) {
            localStorage.removeItem(CONSTANTS.APP_TOKEN);
            localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.token);
            this.router.navigate(['applications']);
            this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, response);
          } else {
            if (response.password_created_date === '') {
              this.isResetPassword = true;
              // $('#changePasswordModal').modal({
              //   backdrop: 'static',
              //   keyboard: false
              // });
              return;
            }
            if (response.apps && response.apps.length > 0) {
              response.apps.forEach(element => {
                let hierarchy = '';
                const keys = Object.keys(element.user.hierarchy);
                keys.forEach((key, index) => {
                  hierarchy = hierarchy + element.user.hierarchy[key] + (keys[index + 1] ? ' / ' : '');
                });
                element.user.hierarchyString = hierarchy;
              });
              this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, response);
              if (this.userData.apps && this.userData.apps.length > 1) {

                this.userData.apps.forEach(app => {
                  const decodedToken = this.commonService.decodeJWTToken(app.token);
                  const obj = {
                    hierarchy: decodedToken.hierarchy,
                    role: decodedToken.role,
                    privileges: decodedToken.privileges
                  };
                  app.user = obj;
                });
                this.router.navigate(['applications', 'selection']);
              } else if (this.userData.apps && this.userData.apps.length === 1) {
                localStorage.removeItem(CONSTANTS.APP_TOKEN);
                localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.apps[0].token);
                const decodedToken = this.commonService.decodeJWTToken(this.userData.apps[0].token);
                const obj = {
                  hierarchy: decodedToken.hierarchy,
                  role: decodedToken.role,
                  privileges: decodedToken.privileges
                };
                this.userData.apps[0].user = obj;
                await this.getApplicationData(this.userData.apps[0]);
                this.router.navigate(['applications', this.applicationData.app]);
                // const menu = this.applicationData.menu_settings.main_menu.length > 0 ?
                // this.applicationData.menu_settings.main_menu : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
                // let i = 0;
                // menu.forEach(menuObj => {
                //   if ( i === 0 && menuObj.visible) {
                //     i++;
                //     const url = menuObj.url;
                //     if (menuObj.url?.includes(':appName')) {
                //       menuObj.url = menuObj.url.replace(':appName', this.applicationData.app);
                //       console.log(menuObj.url);
                //       this.router.navigateByUrl(menuObj.url);
                //     }
                //   }
                // });
              }
            } else {
              this.isLoginAPILoading = false;
              this.toasterService.showError('No apps are assigned to this user', 'Contact Administrator');
              return;
            }

          }
          this.isLoginAPILoading = false;
        }, error => {
          this.isLoginAPILoading = false;
          this.toasterService.showError(error.message, 'Login');
        }
      ));
    } else {
      this.isLoginAPILoading = false;
      this.toasterService.showError('Please enter username and password', 'Login');
    }
  }

  getApplicationData(app) {
    return new Promise((resolve) => {
      this.applicationData = undefined;
      this.subscriptions.push(this.applicationService.getApplicationDetail(app.app).subscribe(
        (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          if (this.applicationData.menu_settings.main_menu.length === 0) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (this.applicationData.menu_settings.asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.asset_control_panel_menu =
              JSON.parse(JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.menu_settings.legacy_asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.legacy_asset_control_panel_menu =
              JSON.parse(JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          if (this.applicationData.menu_settings.model_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.model_control_panel_menu =
              JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          const obj = {
            hierarchy: this.applicationData.user.hierarchy,
            dateOption: 'Last 24 Hours'
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          const obj1 = {
            dateOption: 'Last 30 Mins'
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

  forgotPassword() {
    if(!this.loginForm.email){
      this.toasterService.showWarning('Please enter valid email', 'Forgot Password');
      return
    }
    let obj = {
      'email': this.loginForm.email
    }
    this.isForgotAPILoading = true;
    this.commonService.forgotPassword(obj).subscribe((response: any) => {
      this.isForgotPassword = true;
      this.isForgotAPILoading = false;
      this.toasterService.showSuccess(response.message, 'Forgot Password');
    }, (err: HttpErrorResponse) => {
      this.isForgotAPILoading = false;
      this.toasterService.showError(err.message, 'Forgot Password');
      this.isForgotPassword = true;

    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
