import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from '../services/toaster.service';
import { CONSTANTS } from './../app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-rdm-login',
  templateUrl: './rdm-login.component.html',
  styleUrls: ['./rdm-login.component.css']
})
export class RDMLoginComponent implements OnInit, AfterViewInit {

  loginForm: any = {};
  usersList: any[] = [];
  userData: any;
  isResetPassword = false;
  isLoginAPILoading = false;
  applicationData: any;
  constructor(
    private router: Router,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {

    this.commonService.resetPassword.subscribe((resetPassword: boolean) => {
      if (!resetPassword) {
        $('#changePasswordModal').modal('hide');
        this.loginForm.reset();
      }
    });
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      if (this.userData.is_super_admin) {
        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 1) {
          this.router.navigate(['applications', 'selection']);
        } else if (this.userData.apps && this.userData.apps.length === 1) {
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

  onLogin() {
    if (this.loginForm.email && this.loginForm.password) {
      this.isLoginAPILoading = true;
      this.commonService.loginUser(this.loginForm).subscribe(
        async (response: any) => {
          this.userData = response;
          if (response.is_super_admin) {
            console.log('in login 28');
            this.router.navigate(['applications']);
            this.commonService.setItemInLocalStorage('userData', response);
          } else {
            if (response.password_created_date === '') {
              this.isResetPassword = true;
              $('#changePasswordModal').modal({
                backdrop: 'static',
                keyboard: false
              });
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
              this.commonService.setItemInLocalStorage('userData', response);
              if (this.userData.apps && this.userData.apps.length > 1) {
                this.router.navigate(['applications', 'selection']);
              } else if (this.userData.apps && this.userData.apps.length === 1) {
                await this.getApplicationData(this.userData.apps[0]);
                this.router.navigate(['applications', this.userData.apps[0].app]);
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
      );
    } else {
      this.isLoginAPILoading = false;
      this.toasterService.showError('Please enter username and password', 'Login');
    }
  }

  getApplicationData(app) {
    return new Promise((resolve) => {
    this.applicationData = undefined;
    this.applicationService.getApplicationDetail(app.app).subscribe(
      (response: any) => {
          this.applicationData = response;
          this.applicationData.app = app.app;
          this.applicationData.user = app.user;
          this.commonService.setItemInLocalStorage(CONSTANTS.SELECTED_APP_DATA, this.applicationData);
          resolve();
      });
    });
  }

}
