import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUrls } from '../app-url.constants';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  createUser(userObj) {
    return this.http.post(this.url + AppUrls.CREATE_USER, userObj);
  }
}
