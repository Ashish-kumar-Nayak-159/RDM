import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from './../services/toaster.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: any = {};
  usersList = [
    {
      email: 'sombabu@kemsys.com',
      username: 'Sombabu Gunithi',
      password: 'admin',
      app: 'IDEX'
    },
    {
      email: 'yash@kemsys.com',
      username: 'Yash Mochi',
      password: 'admin',
      app: 'ccd'
    },
    {
      email: 'urvisha@kemsys.com',
      username: 'Urvisha Seladiya',
      password: 'admin',
      app: 'ccd'
    }
  ];
  userData: any;
  constructor(
    private router: Router,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    if (this.userData) {

      console.log('in if');
      this.router.navigate(['applications', this.userData.app]);
    }
  }

  onLogin() {
    if (this.loginForm.email && this.loginForm.password) {
      let flag = false;
      this.usersList.forEach(user => {
        if (user.email === this.loginForm.email && user.password === this.loginForm.password) {
          flag = true;
          const obj = {...user};
          delete obj.password;
          console.log(obj);
          localStorage.setItem('userData', JSON.stringify(obj));
          console.log(localStorage.getItem('userData'));
          this.router.navigate(['applications', obj.app]);
        }
      });
      if (!flag) {
        this.toasterService.showError('Invalid email or password', 'Login');
      }
    } else {
      this.toasterService.showError('Please enter username and password', 'Login');
    }
  }

}
