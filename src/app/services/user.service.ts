import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUrls } from '../app-url.constants';
import { String } from 'typescript-string-operations';
import { CONSTANTS } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  createUser(userObj, app) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_USER, app), userObj);
  }

  updateUser(userObj, app) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_USER, app, userObj.id), userObj);
  }
}
