import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { Observable, throwError } from 'rxjs';
import { String } from 'typescript-string-operations';
import { catchError, map, filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UpTimeService {
  url = environment.appServerURL;

  constructor(private http: HttpClient) { }

  getUpTime(obj: any) {
    let params = new HttpParams().set('epoch', true);
    if (obj.asset_id)
      params = params.set('asset_id', obj.asset_id);

    params = params.set('from_date', obj.fromdate);
    params = params.set('to_date', obj.todate);
    params = params.set('offset', obj.offset);
    params = params.set('count', obj.count);

    return this.http.get(this.url + AppUrls.GET_UPTIME, { params })
  }

  getUpTimeHistory(obj: any) {
    let params = new HttpParams().set('epoch', true);
    if (obj.asset_id)
      params = params.set('asset_id', obj.asset_id);

    params = params.set('hierarchy', obj.hierarchy);
    params = params.set('from_date', obj.fromdate);
    params = params.set('to_date', obj.todate);
    params = params.set('offset', obj.offset);
    params = params.set('count', obj.count);

    return this.http.get(this.url + AppUrls.GET_UPTIME_HISTORY, { params })
  }

  getUpTimeById(id: any, asset_id: any) {
    let params = new HttpParams().set('asset_id', asset_id);
    return this.http.get(this.url + String.Format(AppUrls.GET_UPTIME_HISTORY_ID, encodeURIComponent(id)), { params })
  }
}
