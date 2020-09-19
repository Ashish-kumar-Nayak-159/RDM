import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUrls } from '../app-url.constants';
import { Router } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  url = environment.appServerURL;
  breadcrumbEvent: EventEmitter<any> = new EventEmitter<any>();
  refreshSideMenuData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  convertUTCDateToLocal(utcDate) {
    if (utcDate) {
      return (moment.utc(utcDate, 'M/DD/YYYY h:mm:ss A')).local().format('DD-MMM-YYYY hh:mm:ss A');
    }
    return null;
  }

  loginUser(obj) {
    return this.http.post(this.url + AppUrls.LOGIN,  obj);
  }

  getItemFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setItemInLocalStorage(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  onLogOut() {
    localStorage.removeItem(CONSTANTS.USER_DETAILS);
    localStorage.removeItem('breadcrumbState');
    this.router.navigate(['']);
  }
}
