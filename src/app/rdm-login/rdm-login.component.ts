import { Component, OnInit } from '@angular/core';
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
export class RDMLoginComponent implements OnInit {

  loginForm: any = {};
  usersList: any[] = [];
  userData: any;
  constructor(
    private router: Router,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.usersList = CONSTANTS.USERS_LIST;
    if (this.userData) {

      console.log('in if');
      this.router.navigate(['applications', this.userData.app]);
    }
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    if ($('.container').hasClass('sb-notoggle')) {
      $('.container').removeClass('sb-notoggle');
    }
  }

  onLogin() {
    if (this.loginForm.email && this.loginForm.password) {
      this.commonService.loginUser(this.loginForm).subscribe(
        (response: any) => {
          localStorage.setItem('userData', JSON.stringify(response));
          console.log(localStorage.getItem('userData'));
          this.router.navigate(['applications', response.app]);
        }, error => this.toasterService.showError(error.message, 'Login')
      );
      // let flag = false;
      // this.usersList.forEach(user => {
      //   if (user.email === this.loginForm.email && user.password === this.loginForm.password) {
      //     flag = true;
      //     const obj = {...user};
      //     delete obj.password;
      //     console.log(obj);
      //     this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, obj);
      //     this.router.navigate(['applications', obj.app]);
      //   }
      // });
      // if (!flag) {
      //   this.toasterService.showError('Invalid email or password', 'Login');
      // }
    } else {
      this.toasterService.showError('Please enter username and password', 'Login');
    }
  }

}
