import { HttpRequest, HttpHandler, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, Observable, throwError } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { CONSTANTS } from "src/app/constants/app.constants";
import { CommonService } from "src/app/services/common.service";
import { ToasterService } from "src/app/services/toaster.service";
import { environment } from "src/environments/environment";
import * as datefns from 'date-fns';
import { AppUrls } from "../constants/app-url.constants";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    authService;
    refreshTokenInProgress = false;

    tokenRefreshedSource = new Subject();
    tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

    constructor(private injector: Injector, private router: Router, private commonService: CommonService, private toasterService: ToasterService) { }

    addAuthHeader(request, next?) {
        const authHeader = this.getAuthorizationHeader(request);
        const newRequest = request.clone({
            headers: authHeader,
        });
        return newRequest;
    }

    refreshToken(): Observable<any> {

        if (this.refreshTokenInProgress) {

            return new Observable(observer => {
                this.tokenRefreshed$.subscribe(() => {
                    observer.next();
                    observer.complete();
                });
            });
        } else {
            this.refreshTokenInProgress = true;
            let refreshToken = localStorage.getItem(CONSTANTS.REFRESH_TOKEN);
            const obj = {
                refresh_token: refreshToken,
                environment: environment.environment,
                app: environment.app
            };
            return this.commonService.refreshToken(obj).pipe(
                tap((resp: any) => {
                    debugger
                    if (resp) {
                        if (localStorage.getItem(CONSTANTS.USER_DETAILS) !== null) {
                            localStorage.removeItem(CONSTANTS.USER_DETAILS);
                            this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, resp);
                        }
                        localStorage.removeItem(CONSTANTS.APP_TOKEN);
                        if (localStorage.getItem(CONSTANTS.SELECTED_APP_DATA) !== null) {
                            let selectedApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
                            let filteredAppToken = resp.apps.filter(r => r.app === selectedApp["app"]);
                            if(!filteredAppToken)
                            {
                                location.reload();
                            }
                            localStorage.setItem(CONSTANTS.APP_TOKEN, filteredAppToken[0].token);
                        }
                        else {
                            localStorage.setItem(CONSTANTS.APP_TOKEN, resp.token);
                        }
                        this.refreshTokenInProgress = false;
                        this.tokenRefreshedSource.next();
                    }
                    else {
                        this.refreshTokenInProgress = false;
                        this.logout();
                        return void (0);
                    }
                }),
                catchError(() => {
                    this.refreshTokenInProgress = false;
                    this.logout();
                    return void (0);
                }));
        }
    }

    logout() {
        this.toasterService.showError('Please login again', 'Session Expired');
        this.commonService.onLogOut();
    }

    handleResponseError(error, request?, next?) {
        debugger
        // Business error
        if (error.status === 400) {
            // Show message
        }

        // Invalid token error
        else if (error.status === 401 && error?.error?.reason === 'cors_error') {
            debugger
            this.toasterService.showError('Please login again', 'Session Expired');
            this.commonService.onLogOut();
        }

        // Access denied error
        else if (error.status === 403) {
            // Show message
            // Logout
            this.logout();
        }

        // Server error
        else if (error.status === 500 || error.status === 503) {
            this.toasterService.showError(
                'Something went wrong. Please try again after sometime',
                'Contact Administrator'
            );
        }
        else if (request.method === 'GET') {
            this.toasterService.showError(error?.error?.message || error.message, '');
        }

        return throwError(error.error);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {

        // Handle request
        request = this.addAuthHeader(request, next);
        let userToken;
        userToken = this.commonService.getToken();
        const decodedUserToken: any = this.commonService.decodeJWTToken(userToken);
        const now = datefns.getUnixTime(new Date());
        if (
            (decodedUserToken && decodedUserToken.exp <= now && !request.url.includes('refresh-token')) ||
            (!userToken &&
                !request.url.includes(AppUrls.SIGNALR_NEGOTIATE) &&
                !request.url.includes('api/login') &&
                !request.url.includes('api/guest_login') &&
                !request.url.includes('api/guest_signup') &&
                !request.url.includes('users/reset_password') &&
                !request.url.includes('users/forgot_password') &&
                !request.url.includes('assets/i18n') &&
                !request.url.includes(environment.blobURL))) {

            console.log('refresh token called');

            return this.refreshToken().pipe(
                switchMap(() => {
                    request = this.addAuthHeader(request);
                    return next.handle(request);
                }),
                catchError(e => {

                    if (e.status !== 401) {
                        return this.handleResponseError(e);
                    } else {
                        this.logout();
                        return void (0);
                    }
                }));

        }
        // Handle response
        return next.handle(request).pipe(catchError(error => {
            return this.handleResponseError(error, request, next);
        }));
    }
    getAuthorizationHeader(request: any) {
        let headers = request.headers ? request.headers : new HttpHeaders();
        let accessToken = this.commonService.getToken();
        if (request.url.includes('api/user_apps')) {
            const userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
            accessToken = userData.token;
        }
        if (accessToken && !request.url.includes(environment.blobURL)) {
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        return headers;
    }
    private Logout() {
        this.toasterService.showError('Please login again', 'Session Expired');
        this.commonService.onLogOut();
        return new Observable();
    }
}

export const AuthInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
};