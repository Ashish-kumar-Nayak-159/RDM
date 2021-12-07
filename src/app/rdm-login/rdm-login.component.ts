import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { environment } from 'src/environments/environment';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { CommonService } from 'src/app/services/common.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
declare var $: any;
@Component({
  selector: 'app-rdm-login',
  templateUrl: './rdm-login.component.html',
  styleUrls: ['./rdm-login.component.css'],
})
export class RDMLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  loginForm: FormGroup;
  registerForm: FormGroup;
  usersList: any[] = [];
  userData: any;
  isResetPassword = false;
  isLoginAPILoading = false;
  applicationData: any;
  subscriptions: Subscription[] = [];
  isPasswordVisible = false;
  isForgotPassword = false;
  isForgotAPILoading = false;
  uiMessages = UIMESSAGES.MESSAGES;
  // previousURL: string;
  otpForm: any = {};
  otpData: any;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  tenantId: string;
  environment: string;
  // istenantId = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
    // this.previousURL = this.route.snapshot.paramMap.get('previousUrl');
    // if (!this.previousURL || this.previousURL === '' || this.previousURL === null) {
    //   this.previousURL = 'cms_dev';
    // }
    // console.log(this.previousURL);
    this.route.paramMap.subscribe(params => {
      this.tenantId = params.get("tenantId");
    });
    console.log(this.tenantId);
    // if (this.tenantId || this.tenantId !== '' || this.tenantId !== null) {
    //   this.istenantId = true;
    // }
    this.environment = environment.environment;
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      await this.processUserData(this.userData);
    }
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.EMAIL_REGEX)]),
      password: new FormControl(null, [Validators.required]),
    });
    this.registerForm = new FormGroup({
      app: new FormControl(this.tenantId, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      phone: new FormControl(null),
      email: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.EMAIL_REGEX)]),
      org: new FormControl(null, Validators.required),
      designation: new FormControl(null),
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

    if (this.environment === 'TEST') {
      if (!this.tenantId || this.tenantId === '' || this.tenantId === null) {
        $('.register-info-box').fadeOut();
        $('.login-info-box').fadeIn();
        $('.white-panel').addClass('right-log');
        $('.register-show').addClass('show-log-panel');
        $('.login-show').removeClass('show-log-panel');
      }
      else {
        $('.register-info-box').fadeIn();
        $('.login-info-box').fadeOut();
        $('.white-panel').removeClass('right-log');
        $('.login-show').addClass('show-log-panel');
        $('.register-show').removeClass('show-log-panel');
      }
    }
    else {
      $('.register-info-box').fadeOut();
      $('.login-info-box').fadeIn();
      $('.white-panel').addClass('right-log');
      $('.register-show').addClass('show-log-panel');
      $('.login-show').removeClass('show-log-panel');
    }
  }

  onRegisterToggle() {
    if ($('#log-login-show').is(':checked')) {
      $('.register-info-box').fadeOut();
      $('.login-info-box').fadeIn();
      $('.white-panel').addClass('right-log');
      $('.register-show').addClass('show-log-panel');
      $('.login-show').removeClass('show-log-panel');
    }
    else if ($('#log-reg-show').is(':checked')) {
      $('.register-info-box').fadeIn();
      $('.login-info-box').fadeOut();
      $('.white-panel').removeClass('right-log');
      $('.login-show').addClass('show-log-panel');
      $('.register-show').removeClass('show-log-panel');
    }
  }

  onResetModalClose() {
    this.isForgotPassword = false;
    this.loginForm.reset();
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSignIn() {
    if (this.otpForm.email_otp) {
      this.isLoginAPILoading = true;
      const app = environment.app;
      if (app) {
        this.otpForm.app = app;
      }
      const env = environment.environment;
      if (env) {
        this.otpForm.environment = env;
      }
      this.otpForm.user_id = this.otpData.user_id;
      this.subscriptions.push(
        this.commonService.userSignIn(this.otpForm).subscribe(
          async (response: any) => {
            this.userData = response;
            localStorage.setItem(CONSTANTS.APP_VERSION, environment.version);
            localStorage.setItem(CONSTANTS.GUEST_USER, 'true');
            if (response.apps && response.apps.length > 0) {
              response.apps.forEach((element) => {
                let hierarchy = '';
                const decodedToken = this.commonService.decodeJWTToken(element.token);
                const keys = Object.keys(decodedToken.hierarchy);
                keys.forEach((key, index) => {
                  hierarchy = hierarchy + decodedToken.hierarchy[key] + (keys[index + 1] ? ' / ' : '');
                });
                element.user = { rule: decodedToken.role, hierarchy: decodedToken.hierarchy };
                element.user.hierarchyString = hierarchy;
              });
              this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, response);

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
            this.isLoginAPILoading = false;
          },
          (error) => {
            this.isLoginAPILoading = false;
            this.toasterService.showError(error.message, 'Guest Login');
          }
        )
      );
    } else {
      this.isLoginAPILoading = false;
      this.toasterService.showError('Please enter OTP', 'Login');
    }
  }

  onSignUp() {
    if ($('#phone').is(':invalid')) {
      this.toasterService.showError('Please enter valid mobile number', 'Guest User Login');
      return;
    }
    const loginObj = this.registerForm.value;
    loginObj.phone = loginObj.phone?.e164Number || null;
    this.isLoginAPILoading = true;
    // loginObj.app = this.tenantId;
    console.log(loginObj);
    this.subscriptions.push(
      this.commonService.userSignUp(loginObj).subscribe(
        async (response: any) => {
          this.otpData = response;
          console.log(this.otpData);
          this.isLoginAPILoading = false;
        },
        (error) => {
          this.isLoginAPILoading = false;
          this.toasterService.showError(error.message, 'Guest Login');
        }
      )
    );
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
          if (!decodedToken.privileges || decodedToken.privileges.length === 0) {
            this.toasterService.showError(
              'User is not having any privileges',
              UIMESSAGES.MESSAGES.CONTACT_ADMINISTRATOR
            );
            this.commonService.onLogOut();
            return;
          }
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
        this.toasterService.showError(this.uiMessages.NO_APPS_ASSIGNED_MESSAGE, this.uiMessages.CONTACT_ADMINISTRATOR);
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
            hierarchy: this.applicationData?.user?.hierarchy,
            dateOption: this.applicationData?.metadata?.filter_settings?.search_duration || 'Last 24 Hours',
          };
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, obj);
          const obj1 = {
            dateOption:
              this.applicationData?.metadata?.filter_settings?.search_duration_control_panel || 'Last 30 Mins',
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
      this.toasterService.showError(
        this.uiMessages.EMAIL_LABEL + this.uiMessages.IS_INVALID,
        this.uiMessages.FORGOT_PASSWORD_LABEL
      );
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
