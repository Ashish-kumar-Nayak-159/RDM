import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../services/common.service';
import { ToasterService } from './../services/toaster.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpHeaders } from '@angular/common/http';

import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AppUrls } from '../app-url.constants';
import * as moment from 'moment';
import { constants } from 'buffer';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  constructor(private toasterService: ToasterService, private commonService: CommonService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let userToken;
    userToken = this.commonService.getToken();
    const decodedUserToken: any = this.commonService.decodeJWTToken(userToken);
    const now = moment().utc().unix();
    if (decodedUserToken && decodedUserToken.exp <= now) {
      this.toasterService.showError('Please login again', 'Session Expired');
      this.commonService.onLogOut();
      return new Observable();
    }
    if (
      !userToken &&
      !request.url.includes('api/login') &&
      !request.url.includes('api/guest_login') &&
      !request.url.includes('api/guest_signup') &&
      !request.url.includes('users/reset_password') &&
      !request.url.includes('users/forgot_password') &&
      !request.url.includes(environment.blobURL)
    ) {
      this.toasterService.showError('Please login again', 'Session Expired');
      this.commonService.onLogOut();
      return new Observable();
    }
    const newHeaders = this.setHeaders(request);
    const newRequest = request.clone({
      headers: newHeaders,
    });
    return next.handle(newRequest).pipe(
      takeUntil(this.ngUnsubscribe),
      // tslint:disable-next-line:no-shadowed-variable
      catchError((error: any) => {
        if (request.method === 'GET') {
          this.toasterService.showError(error?.error?.message || error.message, '');
        }
        if (
          error.status === 401 &&
          (error?.error?.reason === 'token_expired' ||
            error?.error?.reason === 'cors_error' ||
            error?.error?.reason === 'invalid_token_signature' ||
            error?.error?.reason === 'invalid_token')
        ) {
          this.ngUnsubscribe.next();
          this.ngUnsubscribe.complete();
          this.toasterService.showError('Please login again', 'Session Expired');
          this.commonService.onLogOut();
        }
        if (error.status === 500 || error.status === 503) {
          // toaster to display data of 500
          this.toasterService.showError(
            'Something went wrong. Please try again after sometime',
            'Contact Administrator'
          );
        }
        return throwError(error.error);
      }),
      map((event: HttpResponse<any>) => {
        if (event instanceof HttpResponse) {
          return event;
        }
      })
    );
  }

  private setHeaders(request) {
    let headers = request.headers ? request.headers : new HttpHeaders();
    let accessToken = this.commonService.getToken();
    if (request.url.includes('api/user_apps')) {
      const userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
      accessToken = userData.token;
    }
    if (accessToken && !request.url.includes(environment.blobURL)) {
      headers = headers.append('Authorization', 'Bearer ' + accessToken);
    }
    return headers;
  }
}
