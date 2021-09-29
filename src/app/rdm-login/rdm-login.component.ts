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
import { FormGroup, FormControl, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-rdm-login',
  templateUrl: './rdm-login.component.html',
  styleUrls: ['./rdm-login.component.css'],
})
export class RDMLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
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
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      await this.processUserData(this.userData);
    }
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.EMAIL_REGEX)]),
      password: new FormControl(null, [Validators.required]),
    });
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
    this.isForgotPassword = false;
    this.loginForm.reset();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    const loginObj = this.loginForm.value;
    this.isLoginAPILoading = true;
    const app = environment.app;
    if (app) {
      loginObj.app = app;
    }
    const env = environment.environment;
    if (env) {
      loginObj.environment = env;
    }
    this.subscriptions.push(
      this.commonService.loginUser(loginObj).subscribe(
        async (response: any) => {
          this.userData = response;
          localStorage.setItem(CONSTANTS.APP_VERSION, environment.version);
          this.loginForm.reset();
          await this.processUserData(response);
          this.isLoginAPILoading = false;
        },
        (error) => {
          this.isLoginAPILoading = false;
          this.toasterService.showError(error.message, 'Login');
        }
      )
    );
  }

  async processUserData(data) {
    // if user is supre admin
    if (data.is_super_admin) {
      localStorage.removeItem(CONSTANTS.APP_TOKEN);
      localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.token);
      this.router.navigate(['applications']);
      this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, data);
    } else {
      // if user is logged in for first time force the user to change password
      if (data.password_created_date === '') {
        this.isResetPassword = true;
        return;
      }
      // user is having application access
      if (data.apps && data.apps.length > 0) {
        // if user is having multiple application access redirect it to app selection page first
        if (this.userData.apps && this.userData.apps.length > 1) {
          this.userData.apps.forEach((app) => {
            const decodedToken = this.commonService.decodeJWTToken(app.token);
            const obj = {
              hierarchy: decodedToken.hierarchy,
              role: decodedToken.role,
              privileges: decodedToken.privileges,
            };
            app.user = obj;
          });
          this.router.navigate(['applications', 'selection']);
          // if user is having only one application access redirect it to home page directly
        } else if (this.userData.apps && this.userData.apps.length === 1) {
          localStorage.removeItem(CONSTANTS.APP_TOKEN);
          localStorage.setItem(CONSTANTS.APP_TOKEN, this.userData.apps[0].token);
          const decodedToken = this.commonService.decodeJWTToken(this.userData.apps[0].token);
          const obj = {
            hierarchy: decodedToken.hierarchy,
            role: decodedToken.role,
            privileges: decodedToken.privileges,
          };
          this.userData.apps[0].user = obj;
          await this.getApplicationData(this.userData.apps[0]);
          this.router.navigate(['applications', this.applicationData.app]);
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);
      } else {
        this.isLoginAPILoading = false;
        this.toasterService.showError('No apps are assigned to this user', 'Contact Administrator');
        return;
      }
    }
  }

  getApplicationData(app) {
    return new Promise<void>((resolve) => {
      this.applicationData = undefined;
      this.subscriptions.push(
        this.applicationService.getApplicationDetail(app.app).subscribe((response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.userData.apps.forEach((appObj) => {
            if (app.app === appObj.app) {
              this.applicationData.user = appObj.user;
            }
          });
          if (this.applicationData.menu_settings.main_menu.length === 0) {
            this.applicationData.menu_settings.main_menu = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
          } else {
            this.processAppMenuData();
          }
          if (this.applicationData.menu_settings.asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.asset_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (this.applicationData.menu_settings.legacy_asset_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.legacy_asset_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (this.applicationData.menu_settings.model_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.model_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST)
            );
          }
          if (this.applicationData.menu_settings.gateway_control_panel_menu.length === 0) {
            this.applicationData.menu_settings.gateway_control_panel_menu = JSON.parse(
              JSON.stringify(CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST)
            );
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          const obj = {
            hierarchy: this.applicationData.user.hierarchy,
            dateOption: 'Last 24 Hours',
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          const obj1 = {
            dateOption: 'Last 30 Mins',
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, obj1);
          resolve();
        })
      );
    });
  }

  processAppMenuData() {
    if (this.applicationData?.app) {
      if (!this.userData?.is_super_admin) {
        const data = [];
        const arr = JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
        if (this.applicationData.menu_settings?.main_menu?.length > 0) {
          arr.forEach((config) => {
            let found = false;
            this.applicationData.menu_settings.main_menu.forEach((item) => {
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
    const loginObj = this.loginForm.value;
    if (!loginObj.email) {
      this.toasterService.showError('Please enter valid email', 'Forgot Password');
      return;
    }
    let obj = {
      email: loginObj.email,
    };
    this.isForgotAPILoading = true;
    this.commonService.forgotPassword(obj).subscribe(
      (response: any) => {
        this.isForgotPassword = true;
        this.isForgotAPILoading = false;
        this.toasterService.showSuccess(response.message, 'Forgot Password');
      },
      (err: HttpErrorResponse) => {
        this.isForgotAPILoading = false;
        this.toasterService.showError(err.message, 'Forgot Password');
        this.isForgotPassword = true;
      }
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
