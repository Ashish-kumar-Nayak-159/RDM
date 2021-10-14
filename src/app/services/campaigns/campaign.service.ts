import { String } from 'typescript-string-operations';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CampaignService {
  url = environment.appServerURL;
  constructor(private http: HttpClient) {}

  getJobCampaigns(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_JOB_CAMPAIGNS, app), { params });
  }

  createCampaign(app, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_JOB_CAMPAIGN, app), obj);
  }

  startJobCampaign(app, campaignCode) {
    return this.http.post(this.url + String.Format(AppUrls.START_JOB_CAMPAIGN, app, campaignCode), {});
  }

  stopJobCampaign(app, campaignCode) {
    return this.http.post(this.url + String.Format(AppUrls.STOP_JOB_CAMPAIGN, app, campaignCode), {});
  }
}
