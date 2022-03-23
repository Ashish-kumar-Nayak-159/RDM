import { CONSTANTS } from 'src/app/constants/app.constants';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { CommonService } from 'src/app/services/common.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { CountryISO, SearchCountryField } from 'ngx-intl-tel-input';
declare var $: any;

@Component({
  selector: 'app-rdm-guest-login',
  templateUrl: './rdm-guest-login.component.html',
  styleUrls: ['./rdm-guest-login.component.css'],
})
export class RdmGuestLoginComponent implements OnInit {
  loginForm: FormGroup;
  otpForm: any = {};
  usersList: any[] = [];
  userData: any;
  otpData: any;
  isResetPassword = false;
  isLoginAPILoading = false;
  applicationData: any;
  subscriptions: Subscription[] = [];
  isPasswordVisible = false;
  isForgotPassword = false;
  isForgotAPILoading = false;
  searchCountryField = SearchCountryField;
  countryISO = CountryISO;
  tenantId: string;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe((paramMap) => {
      if (paramMap.get('tenantId')) {
        this.tenantId = paramMap.get('tenantId');
      }
    });
    this.loginForm = new FormGroup({
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
      $('.container-fluid').removeClass('sb-notoggle');
    }
  }

  onResetModalClose() {
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
    const loginObj = this.loginForm.value;
    loginObj.phone = loginObj.phone?.e164Number || null;
    this.isLoginAPILoading = true;
    loginObj.app = this.tenantId;
    this.subscriptions.push(
      this.commonService.userSignUp(loginObj).subscribe(
        async (response: any) => {
          this.otpData = response;
          this.isLoginAPILoading = false;
        },
        (error) => {
          this.isLoginAPILoading = false;
          this.toasterService.showError(error.message, 'Guest Login');
        }
      )
    );
  }

  getApplicationData(app) {
    return new Promise<void>((resolve) => {
      this.applicationData = undefined;
      this.subscriptions.push(
        this.applicationService.getApplicationDetail(app.app, true).subscribe((response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
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
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          this.applicationService.getExportedHierarchy().subscribe((response: any) => {
            localStorage.removeItem(CONSTANTS.HIERARCHY_TAGS);
            if(response)
            {
              this.commonService.setItemInLocalStorage(CONSTANTS.HIERARCHY_TAGS, response);
            }
          });
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

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
