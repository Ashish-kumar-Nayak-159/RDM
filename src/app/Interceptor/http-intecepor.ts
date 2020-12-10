import { ToasterService } from './../services/toaster.service';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(
    private toasterService: ToasterService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      // tslint:disable-next-line:no-shadowed-variable
      catchError((error: any) => {
        console.log(error);
        console.log(request);
        if (request.method === 'GET') {
          this.toasterService.showError(error.message, '');
        }
        if (error.status === 401) {
          // logout code
        }
        if (error.status === 500) {
          // toaster to display data of 500
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
}
