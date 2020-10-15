import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUrls } from 'src/app/app-url.constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeviceTypeService {

  url = environment.appServerURL;
  constructor(
    private http: HttpClient
  ) { }

  getThingsModelsList(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODELS, { params });
  }

  createThingsModel(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.post(this.url + AppUrls.CREATE_THINGS_MODEL, modelObj, {params});
  }

  updateThingsModel(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.patch(this.url + AppUrls.UPDATE_THINGS_MODEL, modelObj, {params});
  }

  getThingsModelProperties(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_PROPERTIES, { params });
  }


  getThingsModelDeviceMethods(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_DEVICE_METHODS, { params });
  }

  getThingsModelControlWidgets(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_CONTROL_WIDGETS, { params });
  }

  createThingsModelControlWidget(modelObj) {
    return this.http.post(this.url + AppUrls.CREATE_THINGS_MODEL_CONTROL_WIDGETS, modelObj);
  }

  updateThingsModelControlWidget(modelObj, app) {
    let params = new HttpParams();
    params = params.set('app', app);
    return this.http.patch(this.url + AppUrls.UPDATE_THINGS_MODEL_CONTROL_WIDGETS, modelObj, {params});
  }
}
