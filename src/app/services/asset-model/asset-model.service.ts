import { CommonService } from 'src/app/services/common.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { AppUrls } from 'src/app/app-url.constants';
import { CONSTANTS } from 'src/app/app.constants';
import { environment } from 'src/environments/environment';
import { String } from 'typescript-string-operations';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AssetModelService {

  url = environment.appServerURL;
  assetModelRefreshData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient,
    private commonService: CommonService
  ) { }

  getThingsModelsList(filterObj) {
    const assetModels = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODELS_LIST);
    if (assetModels) {
      if (filterObj['id'] || filterObj['name'] || filterObj['model_type'] || filterObj['created_by']) {
      let models = assetModels;
      if (filterObj['id']) {
        models = models.filter(modelObj => modelObj.id === filterObj['id']);
      }
      if (filterObj['name']) {
        models = models.filter(modelObj => modelObj.name === filterObj['name']);
      }
      if (filterObj['model_type']) {
        models = models.filter(modelObj => modelObj.model_type === filterObj['model_type']);
      }
      if (filterObj['created_by']) {
        models = models.filter(modelObj => modelObj.created_by === filterObj['created_by']);
      }
      return new Observable((observer) => {
        observer.next({
          data: models
        });
      });
    } else {
        return new Observable((observer) => {
          observer.next({
            data: assetModels
          });
        });
      }
    } else {
      let params = new HttpParams();
      (Object.keys(filterObj)).forEach(key => {
        if (filterObj[key]) {
          params = params.set(key, filterObj[key]);
        }
      });

      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODELS, encodeURIComponent(filterObj.app)), { params })
      .pipe( map((data: any) => {
        if (!filterObj['id'] && !filterObj['name'] && !filterObj['model_type'] && !filterObj['created_by']) {
          this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODELS_LIST, data.data);
        }
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelDetails(app, name) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_DETAILS, encodeURIComponent(app), encodeURIComponent(name)));
  }

  createThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL, encodeURIComponent(app)), modelObj);
  }

  updateThingsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL, encodeURIComponent(app),
    encodeURIComponent(modelObj.name)), modelObj);
  }

  getThingsModelProperties(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.name) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.properties && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = assetModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            assetModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_PROPERTIES,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (assetModel) {
          obj = {...assetModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            properties: data.properties
          };
        } else {
          obj['properties'] = data.properties;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelLayout(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.name) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.historical_widgets && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = assetModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            assetModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_LAYOUT,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (assetModel) {
          obj = {...assetModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            historical_widgets: data.historical_widgets
          };
        } else {
          obj['historical_widgets'] = data.historical_widgets;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  getThingsModelLiveWidgets(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.name) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.live_widgets && (filterObj['id'] || filterObj['name'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['name']) {
        flag = assetModel.name === filterObj.name;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            assetModel
          );
        });
      }
    } else {
      return this.http.get(this.url + String.Format(AppUrls.GET_LIVE_WIDGETS_FOR_MODEL,
        encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)))
      .pipe( map((data: any) => {
        let obj = {};
        if (assetModel) {
          obj = {...assetModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            name: data.name,
            live_widgets: data.live_widgets
          };
        } else {
          obj['live_widgets'] = data.live_widgets;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  freezeAssetModel(app, assetModel, obj) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.FREEZE_THINGS_MODEL, encodeURIComponent(app),
    encodeURIComponent(assetModel)), obj);
  }

  unfreezeAssetModel(app, assetModel, obj) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(this.url + String.Format(AppUrls.UNFREEZE_THINGS_MODEL,
      encodeURIComponent(app), encodeURIComponent(assetModel)), obj);
  }


  getThingsModelAssetMethods(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_ASSET_METHODS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.name)));
  }

  getThingsModelControlWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_model)));
  }

  createThingsModelControlWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(modelObj.app), encodeURIComponent(modelObj.asset_model)), modelObj);
  }

  updateThingsModelControlWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONTROL_WIDGETS,
      encodeURIComponent(app), encodeURIComponent(modelObj.assetModel), encodeURIComponent(modelObj.id)), modelObj);
  }

  deleteThingsModelControlWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONTROL_WIDGET,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_model), encodeURIComponent(filterObj.id)));
  }

  getThingsModelConfigurationWidgets(filterObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_model)));
  }

  createThingsModelConfigurationWidget(modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(modelObj.app), encodeURIComponent(modelObj.asset_model)), modelObj);
  }

  updateThingsModelConfigurationWidget(modelObj, app) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_THINGS_MODEL_CONFIGURATION_WIDGETS,
      encodeURIComponent(app), encodeURIComponent(modelObj.assetModel), encodeURIComponent(modelObj.id)), modelObj);
  }

  deleteThingsModelConfigurationWidget(filterObj) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_CONFIGURATION_WIDGET,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_model), encodeURIComponent(filterObj.id)));
  }

  getThingsModelDocuments(filterObj) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.id !== filterObj.id || assetModel?.name !== filterObj.asset_model) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.documents && (filterObj['id'] || filterObj['asset_model'])) {
      let flag = false;
      if (filterObj['id']) {
        flag = assetModel.id === filterObj.id;
      } else if (filterObj['asset_model']) {
        flag = assetModel.name === filterObj.asset_model;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(
            assetModel.documents
          );
        });
      }
    } else {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(filterObj.app), encodeURIComponent(filterObj.asset_model)))
      .pipe( map((data: any) => {
        let obj = {};
        if (assetModel) {
          obj = {...assetModel};
        }
        if (Object.keys(obj).length === 0) {
          obj = {
            id: filterObj?.id,
            name: filterObj?.asset_model,
            documents: data
          };
        } else {
          obj['documents'] = data;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
        return data;
      }), catchError( error => {
        return throwError( error);
      })
      );
    }
  }

  createThingsModelDocument(modelObj, app, assetModel) {
    const assetModelItem = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModelItem && assetModelItem.documents && assetModelItem.name === assetModel) {
      delete assetModelItem.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, assetModelItem);
    }
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(assetModel)), modelObj);
  }

  updateThingsModelDocument(modelObj, app, assetModel, documentId) {
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(assetModel), encodeURIComponent(documentId)), modelObj);
  }

  deleteThingsModelDocument(id, app, assetModel) {
    const params = new HttpParams().set('id', id);
    const assetModelItem = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModelItem && assetModelItem.documents && assetModelItem.name === assetModel) {
      delete assetModelItem.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, assetModelItem);
    }
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_REFERENCE_DOCUMENTS,
      encodeURIComponent(app), encodeURIComponent(assetModel), encodeURIComponent(id)), {});
  }

  getThingsModelAckReasons(modelObj) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_ACKNOWLEDGEMENT_REASONS, encodeURIComponent(modelObj.app),
    encodeURIComponent(modelObj.name)));
  }

  createThingsModelAckReasons(obj, modelObj) {
    return this.http.post(this.url + String.Format(AppUrls.GET_MODEL_ACKNOWLEDGEMENT_REASONS, encodeURIComponent(modelObj.app),
    encodeURIComponent(modelObj.name)), obj);
  }

  updateThingsModelAckReasons(id, obj, modelObj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_ACKNOWLEDGEMENT_REASONS, encodeURIComponent(modelObj.app),
    encodeURIComponent(modelObj.name), encodeURIComponent(id)), obj);
  }

  deleteThingsModelAckReasons(id, modelObj) {
    return this.http.delete(this.url + String.Format(AppUrls.UPDATE_MODEL_ACKNOWLEDGEMENT_REASONS, encodeURIComponent(modelObj.app),
    encodeURIComponent(modelObj.name), encodeURIComponent(id)), {});
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, encodeURIComponent(app), filterObj.asset_model), {params});
  }

  createAlertCondition(modelObj, app, assetModel) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(assetModel)), modelObj);
  }

  updateAlertCondition(modelObj, app, assetModel, alertConditionId) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(assetModel), encodeURIComponent(alertConditionId)), modelObj);
  }

  deleteAlertCondition(app, assetModel, alertConditionId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_ALERT_CONDITION,
      encodeURIComponent(app), encodeURIComponent(assetModel), encodeURIComponent(alertConditionId)), {});
  }

  getModelReasons(app, assetModel) {
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_ALERT_REASONS,
      encodeURIComponent(app), encodeURIComponent(assetModel)));
  }

  syncModelCache(app, assetModel) {
    let params = new HttpParams();
    params = params.set('asset_model', assetModel);
    return this.http.get(this.url + String.Format(AppUrls.SYNC_MODEL_CACHE, encodeURIComponent(app)), { params });
  }

  getPackages(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_PACKAGES, encodeURIComponent(app), encodeURIComponent(assetModel)), {params});
  }

  createPackage(app, assetModel, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_PACKAGE, encodeURIComponent(app), encodeURIComponent(assetModel)), obj);
  }

  updatePackage(app, assetModel, packageId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_PACKAGE, encodeURIComponent(app), encodeURIComponent(assetModel),
    encodeURIComponent(packageId)), obj);
  }

  deletePackage(app, assetModel, packageId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_PACKAGE, encodeURIComponent(app),
    encodeURIComponent(assetModel), encodeURIComponent(packageId)), {});
  }

  getRules(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_MODEL_RULES, encodeURIComponent(app),
    encodeURIComponent(assetModel)), {params});
  }

  getDerivedKPIs(app, assetModel) {
    return this.http.get(this.url + String.Format(AppUrls.GET_ASSET_MODEL_DERIVED_KPIS, encodeURIComponent(app),
    encodeURIComponent(assetModel)));
  }

  getModelSlaveDetails(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetModel)), {params});
  }

  createModelSlaveDetail(app, assetModel, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetModel)), obj);
  }

  updateModelSlaveDetail(app, assetModel, slaveId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_SLAVE_DETAILS,
      encodeURIComponent(app), encodeURIComponent(assetModel),
    encodeURIComponent(slaveId)), obj);
  }

  deleteModelSlaveDetail(app, assetModel, slaveId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_SLAVE_DETAILS, encodeURIComponent(app),
    encodeURIComponent(assetModel), encodeURIComponent(slaveId)), {});
  }

  getModelSlavePositions(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_SLAVE_POSITIONS,
      encodeURIComponent(app), encodeURIComponent(assetModel)), {params});
  }

  createModelSlavePosition(app, assetModel, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_SLAVE_POSITIONS,
      encodeURIComponent(app), encodeURIComponent(assetModel)), obj);
  }

  updateModelSlavePosition(app, assetModel, slaveId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_SLAVE_POSITIONS,
      encodeURIComponent(app), encodeURIComponent(assetModel),
    encodeURIComponent(slaveId)), obj);
  }

  deleteModelSlavePosition(app, assetModel, slaveId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_SLAVE_POSITIONS, encodeURIComponent(app),
    encodeURIComponent(assetModel), encodeURIComponent(slaveId)), {});
  }

  getModelSlaveCategories(app, assetModel, filterObj) {
    let params = new HttpParams();
    (Object.keys(filterObj)).forEach(key => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(this.url + String.Format(AppUrls.GET_MODEL_SLAVE_CATEGORIES,
      encodeURIComponent(app), encodeURIComponent(assetModel)), {params});
  }

  createModelSlaveCategory(app, assetModel, obj) {
    return this.http.post(this.url + String.Format(AppUrls.CREATE_MODEL_SLAVE_CATEGORIES,
      encodeURIComponent(app), encodeURIComponent(assetModel)), obj);
  }

  updateModelSlaveCategory(app, assetModel, slaveId, obj) {
    return this.http.patch(this.url + String.Format(AppUrls.UPDATE_MODEL_SLAVE_CATEGORIES,
      encodeURIComponent(app), encodeURIComponent(assetModel),
    encodeURIComponent(slaveId)), obj);
  }

  deleteModelSlaveCategory(app, assetModel, slaveId) {
    return this.http.delete(this.url + String.Format(AppUrls.DELETE_MODEL_SLAVE_CATEGORIES, encodeURIComponent(app),
    encodeURIComponent(assetModel), encodeURIComponent(slaveId)), {});
  }
}
