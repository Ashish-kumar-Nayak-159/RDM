import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { String } from 'typescript-string-operations';
import { CONSTANTS } from 'src/app/constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  url = environment.appServerURL;
  constructor(private http: HttpClient) {}

  createUser(userObj, app) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_USER, encodeURIComponent(app)), userObj);
  }

  updateUser(userObj, app) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.patch(
      this.url + String.Format(AppUrls.UPDATE_USER, encodeURIComponent(app), encodeURIComponent(userObj.id)),
      userObj
    );
  }

  deleteUser(app, userId, obj) {
    localStorage.removeItem(CONSTANTS.APP_USERS);
    return this.http.request(
      'delete',
      this.url + String.Format(AppUrls.DELETE_USER_ACCESS, encodeURIComponent(app), encodeURIComponent(userId)),
      { body: obj }
    );
  }
}
