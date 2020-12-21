import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUrls } from 'src/app/app-url.constants';
import { environment } from 'src/environments/environment';
import { String } from 'typescript-string-operations';

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

  getThingsModelLayout(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.get(this.url + AppUrls.GET_THINGS_MODEL_LAYOUT, { params });
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

  deleteThingsModelControlWidget(filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.delete(this.url + AppUrls.DELETE_CONTROL_WIDGET, { params });
  }

  getThingsModelDocuments(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_REFERENCE_DOCUMENTS, filterObj.app, filterObj.device_type));
  }

  createThingsModelDocument(modelObj, app, deviceType) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_REFERENCE_DOCUMENTS, app, deviceType), modelObj);
  }

  deleteThingsModelDocument(id, app, deviceType) {
    const params = new HttpParams().set('id', id);
    console.log(params);
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_REFERENCE_DOCUMENTS, app, deviceType, id), {});
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      params = params.set(key, filterObj[key]);
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, app), { params });
  }

  createAlertCondition(modelObj, app, deviceType) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ALERT_CONDITION, app, deviceType), modelObj);
  }

  updateAlertCondition(modelObj, app, deviceType, alertConditionId) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ALERT_CONDITION, app, deviceType, alertConditionId), modelObj);
  }

  deleteAlertCondition(app, deviceType, alertConditionId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ALERT_CONDITION, app, deviceType, alertConditionId), {});
  }

  getModelReasons(app, deviceType) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_ALERT_REASONS, app, deviceType));
  }
}
