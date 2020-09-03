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
  isLoginAPILoading = false;
  constructor(
    private router: Router,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.usersList = CONSTANTS.USERS_LIST;
    if (this.userData) {
      if (this.userData.is_super_admin) {

        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 0) {
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
        (response: any) => {

          if (response.is_super_admin) {
            console.log('in login 28');
            this.router.navigate(['applications']);
            this.commonService.setItemInLocalStorage('userData', response);
          } else {
            if (response.apps && response.apps.length > 0) {
              this.router.navigate(['applications', response.apps[0].app]);
              this.commonService.setItemInLocalStorage('userData', response);
            } else {
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
      this.toasterService.showError('Please enter username and password', 'Login');
    }
  }

}
