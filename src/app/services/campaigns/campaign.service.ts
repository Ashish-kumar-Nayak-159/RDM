import { String } from 'typescript-string-operations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUrls } from 'src/app/app-url.constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  getJobCampaigns(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_JOB_CAMPAIGNS, app), { params });
  }
}
