import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      // tslint:disable-next-line:no-shadowed-variable
      catchError((error: any) => {
        console.log(error);
        if (error.status === 401) {
          // logout code
        }
        if (error.status === 500) {
          // toaster to display data of 500
        }
        return throwError(error);
      }),
      map((event: HttpResponse<any>) => {
        if (event instanceof HttpResponse) {
          return event;
        }
      })
    );
  }
}
