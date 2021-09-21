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
  providedIn: 'root',
})
export class AssetModelService {
  url = environment.appServerURL;
  assetModelRefreshData: EventEmitter<any> = new EventEmitter<any>();
  constructor(private http: HttpClient, private commonService: CommonService) {}

  getAssetsModelsList(filterObj) {
    const assetModels = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODELS_LIST);
    if (assetModels) {
      if (filterObj['id'] || filterObj['name'] || filterObj['model_type'] || filterObj['created_by']) {
        let models = assetModels;
        if (filterObj['id']) {
          models = models.filter((modelObj) => modelObj.id === filterObj['id']);
        }
        if (filterObj['name']) {
          models = models.filter((modelObj) => modelObj.name === filterObj['name']);
        }
        if (filterObj['model_type']) {
          models = models.filter((modelObj) => modelObj.model_type === filterObj['model_type']);
        }
        if (filterObj['created_by']) {
          models = models.filter((modelObj) => modelObj.created_by === filterObj['created_by']);
        }
        return new Observable((observer) => {
          observer.next({
            data: models,
          });
        });
      } else {
        return new Observable((observer) => {
          observer.next({
            data: assetModels,
          });
        });
      }
    } else {
      let params = new HttpParams();
      Object.keys(filterObj).forEach((key) => {
        if (filterObj[key]) {
          params = params.set(key, filterObj[key]);
        }
      });

      return this.http
        .get(this.url + String.Format(AppUrls.GET_ASSETS_MODELS, encodeURIComponent(filterObj.app)), { params })
        .pipe(
          map((data: any) => {
            if (!filterObj['id'] && !filterObj['name'] && !filterObj['model_type'] && !filterObj['created_by']) {
              this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODELS_LIST, data.data);
            }
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getAssetsModelDetails(app, name) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSETS_MODEL_DETAILS, encodeURIComponent(app), encodeURIComponent(name))
    );
  }

  createAssetsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    return this.http.post(this.url + String.Format(AppUrls.CREATE_ASSETS_MODEL, encodeURIComponent(app)), modelObj);
  }

  updateAssetsModel(modelObj, app) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.patch(
      this.url + String.Format(AppUrls.UPDATE_ASSETS_MODEL, encodeURIComponent(app), encodeURIComponent(modelObj.name)),
      modelObj
    );
  }

  getAssetsModelProperties(filterObj) {
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
          observer.next(assetModel);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_ASSETS_MODEL_PROPERTIES,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.name)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                name: data.name,
                properties: data.properties,
              };
            } else {
              obj['properties'] = data.properties;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getDerivedKPIs(app, assetModelName) {
    let assetModel = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModel?.name !== assetModelName) {
      assetModel = undefined;
    }
    if (assetModel && assetModel.derived_kpis && assetModelName) {
      let flag = false;
      if (assetModelName) {
        flag = assetModel.name === assetModelName;
      }
      if (flag) {
        return new Observable((observer) => {
          observer.next(assetModel);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_ASSET_MODEL_DERIVED_KPIS,
              encodeURIComponent(app),
              encodeURIComponent(assetModelName)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            obj = {
              name: assetModelName,
              derived_kpis: data.data,
            };
            console.log(obj);
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getAssetsModelLayout(filterObj) {
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
          observer.next(assetModel);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_ASSETS_MODEL_LAYOUT,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.name)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                name: data.name,
                historical_widgets: data.historical_widgets,
              };
            } else {
              obj['historical_widgets'] = data.historical_widgets;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  getAssetsModelLiveWidgets(filterObj) {
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
          observer.next(assetModel);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_LIVE_WIDGETS_FOR_MODEL,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.name)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                name: data.name,
                live_widgets: data.live_widgets,
              };
            } else {
              obj['live_widgets'] = data.live_widgets;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  freezeAssetModel(app, assetModel, obj) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(
      this.url + String.Format(AppUrls.FREEZE_ASSETS_MODEL, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  unfreezeAssetModel(app, assetModel, obj) {
    localStorage.removeItem(CONSTANTS.ASSET_MODELS_LIST);
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.post(
      this.url + String.Format(AppUrls.UNFREEZE_ASSETS_MODEL, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  getAssetsModelAssetMethods(filterObj) {
    return this.http.get(
      this.url +
        String.Format(
          AppUrls.GET_ASSETS_MODEL_ASSET_METHODS,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.name)
        )
    );
  }

  getAssetsModelControlWidgets(filterObj) {
    return this.http.get(
      this.url +
        String.Format(
          AppUrls.GET_ASSETS_MODEL_CONTROL_WIDGETS,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.asset_model)
        )
    );
  }

  createAssetsModelControlWidget(modelObj) {
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.CREATE_ASSETS_MODEL_CONTROL_WIDGETS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.asset_model)
        ),
      modelObj
    );
  }

  updateAssetsModelControlWidget(modelObj, app) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ASSETS_MODEL_CONTROL_WIDGETS,
          encodeURIComponent(app),
          encodeURIComponent(modelObj.assetModel),
          encodeURIComponent(modelObj.id)
        ),
      modelObj
    );
  }

  deleteAssetsModelControlWidget(filterObj) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_CONTROL_WIDGET,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.asset_model),
          encodeURIComponent(filterObj.id)
        )
    );
  }

  getAssetsModelConfigurationWidgets(filterObj) {
    return this.http.get(
      this.url +
        String.Format(
          AppUrls.GET_ASSETS_MODEL_CONFIGURATION_WIDGETS,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.asset_model)
        )
    );
  }

  createAssetsModelConfigurationWidget(modelObj) {
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.CREATE_ASSETS_MODEL_CONFIGURATION_WIDGETS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.asset_model)
        ),
      modelObj
    );
  }

  updateAssetsModelConfigurationWidget(modelObj, app) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ASSETS_MODEL_CONFIGURATION_WIDGETS,
          encodeURIComponent(app),
          encodeURIComponent(modelObj.assetModel),
          encodeURIComponent(modelObj.id)
        ),
      modelObj
    );
  }

  deleteAssetsModelConfigurationWidget(filterObj) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_CONFIGURATION_WIDGET,
          encodeURIComponent(filterObj.app),
          encodeURIComponent(filterObj.asset_model),
          encodeURIComponent(filterObj.id)
        )
    );
  }

  getAssetsModelDocuments(filterObj) {
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
          observer.next(assetModel.documents);
        });
      }
    } else {
      return this.http
        .get(
          this.url +
            String.Format(
              AppUrls.GET_MODEL_REFERENCE_DOCUMENTS,
              encodeURIComponent(filterObj.app),
              encodeURIComponent(filterObj.asset_model)
            )
        )
        .pipe(
          map((data: any) => {
            let obj = {};
            if (assetModel) {
              obj = { ...assetModel };
            }
            if (Object.keys(obj).length === 0) {
              obj = {
                id: filterObj?.id,
                name: filterObj?.asset_model,
                documents: data,
              };
            } else {
              obj['documents'] = data;
            }
            this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, obj);
            return data;
          }),
          catchError((error) => {
            return throwError(error);
          })
        );
    }
  }

  createAssetsModelDocument(modelObj, app, assetModel) {
    const assetModelItem = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModelItem && assetModelItem.documents && assetModelItem.name === assetModel) {
      delete assetModelItem.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, assetModelItem);
    }
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.CREATE_MODEL_REFERENCE_DOCUMENTS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel)
        ),
      modelObj
    );
  }

  updateAssetsModelDocument(modelObj, app, assetModel, documentId) {
    localStorage.removeItem(CONSTANTS.ASSET_MODEL_DATA);
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_REFERENCE_DOCUMENTS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(documentId)
        ),
      modelObj
    );
  }

  deleteAssetsModelDocument(id, app, assetModel) {
    const params = new HttpParams().set('id', id);
    const assetModelItem = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_MODEL_DATA);
    if (assetModelItem && assetModelItem.documents && assetModelItem.name === assetModel) {
      delete assetModelItem.documents;
      this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_MODEL_DATA, assetModelItem);
    }
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_MODEL_REFERENCE_DOCUMENTS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(id)
        ),
      {}
    );
  }

  getAssetsModelAckReasons(modelObj) {
    return this.http.get(
      this.url +
        String.Format(
          AppUrls.GET_MODEL_ACKNOWLEDGEMENT_REASONS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.name)
        )
    );
  }

  createAssetsModelAckReasons(obj, modelObj) {
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.GET_MODEL_ACKNOWLEDGEMENT_REASONS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.name)
        ),
      obj
    );
  }

  updateAssetsModelAckReasons(id, obj, modelObj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_ACKNOWLEDGEMENT_REASONS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.name),
          encodeURIComponent(id)
        ),
      obj
    );
  }

  deleteAssetsModelAckReasons(id, modelObj) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_ACKNOWLEDGEMENT_REASONS,
          encodeURIComponent(modelObj.app),
          encodeURIComponent(modelObj.name),
          encodeURIComponent(id)
        ),
      {}
    );
  }

  getAlertConditions(app, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ALERT_CONDITIONS, encodeURIComponent(app), filterObj.asset_model),
      { params }
    );
  }

  createAlertCondition(modelObj, app, assetModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.CREATE_ALERT_CONDITION, encodeURIComponent(app), encodeURIComponent(assetModel)),
      modelObj
    );
  }

  updateAlertCondition(modelObj, app, assetModel, alertConditionId) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_ALERT_CONDITION,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(alertConditionId)
        ),
      modelObj
    );
  }

  deleteAlertCondition(app, assetModel, alertConditionId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_ALERT_CONDITION,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(alertConditionId)
        ),
      {}
    );
  }

  getModelReasons(app, assetModel) {
    return this.http.get(
      this.url + String.Format(AppUrls.GET_MODEL_ALERT_REASONS, encodeURIComponent(app), encodeURIComponent(assetModel))
    );
  }

  syncModelCache(app, assetModel) {
    let params = new HttpParams();
    params = params.set('asset_model', assetModel);
    return this.http.get(this.url + String.Format(AppUrls.SYNC_MODEL_CACHE, encodeURIComponent(app)), { params });
  }

  getPackages(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_PACKAGES, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  createPackage(app, assetModel, obj) {
    return this.http.post(
      this.url + String.Format(AppUrls.CREATE_PACKAGE, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  updatePackage(app, assetModel, packageId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_PACKAGE,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(packageId)
        ),
      obj
    );
  }

  deletePackage(app, assetModel, packageId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_PACKAGE,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(packageId)
        ),
      {}
    );
  }

  getRules(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url + String.Format(AppUrls.GET_ASSET_MODEL_RULES, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  getModelSlaveDetails(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_MODEL_SLAVE_DETAILS, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  createModelSlaveDetail(app, assetModel, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_MODEL_SLAVE_DETAILS, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  updateModelSlaveDetail(app, assetModel, slaveId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_SLAVE_DETAILS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      obj
    );
  }

  deleteModelSlaveDetail(app, assetModel, slaveId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_MODEL_SLAVE_DETAILS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      {}
    );
  }

  getModelSlavePositions(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_MODEL_SLAVE_POSITIONS, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  createModelSlavePosition(app, assetModel, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_MODEL_SLAVE_POSITIONS, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  updateModelSlavePosition(app, assetModel, slaveId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_SLAVE_POSITIONS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      obj
    );
  }

  deleteModelSlavePosition(app, assetModel, slaveId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_MODEL_SLAVE_POSITIONS,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      {}
    );
  }

  getModelSlaveCategories(app, assetModel, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.get(
      this.url +
        String.Format(AppUrls.GET_MODEL_SLAVE_CATEGORIES, encodeURIComponent(app), encodeURIComponent(assetModel)),
      { params }
    );
  }

  createModelSlaveCategory(app, assetModel, obj) {
    return this.http.post(
      this.url +
        String.Format(AppUrls.CREATE_MODEL_SLAVE_CATEGORIES, encodeURIComponent(app), encodeURIComponent(assetModel)),
      obj
    );
  }

  updateModelSlaveCategory(app, assetModel, slaveId, obj) {
    return this.http.patch(
      this.url +
        String.Format(
          AppUrls.UPDATE_MODEL_SLAVE_CATEGORIES,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      obj
    );
  }

  deleteModelSlaveCategory(app, assetModel, slaveId) {
    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_MODEL_SLAVE_CATEGORIES,
          encodeURIComponent(app),
          encodeURIComponent(assetModel),
          encodeURIComponent(slaveId)
        ),
      {}
    );
  }

  // Rule
  createNewCloudModelRule(app, modelName, ruleModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.UPDATE_CLOUD_MODEL_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  updateCloudModelRule(app, modelName, ruleModel) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_CLOUD_MODEL_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  deleteCloudModelRule(app, id, rule_type, updated_by, rule_type_id) {
    let params = new HttpParams();
    params = params
      .set('id', id)
      .set('rule_type', rule_type)
      .set('updated_by', updated_by)
      .set('rule_type_id', rule_type_id);

    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_CLOUD_MODEL_RULE,
          encodeURIComponent(app),
          encodeURIComponent(id),
          encodeURIComponent(rule_type),
          encodeURIComponent(updated_by),
          encodeURIComponent(rule_type_id)
        ),
      { params }
    );
  }
  createNewEdgeModelRule(app, modelName, ruleModel) {
    return this.http.post(
      this.url + String.Format(AppUrls.UPDATE_EDGE_MODEL_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  updateEdgeModelRule(app, modelName, ruleModel) {
    return this.http.put(
      this.url + String.Format(AppUrls.UPDATE_EDGE_MODEL_RULE, encodeURIComponent(app), encodeURIComponent(modelName)),
      ruleModel
    );
  }

  deleteEdgeModelRule(app, id, rule_type, updated_by, rule_type_id) {
    let params = new HttpParams();
    params = params
      .set('id', id)
      .set('rule_type', rule_type)
      .set('updated_by', updated_by)
      .set('rule_type_id', rule_type_id);

    return this.http.delete(
      this.url +
        String.Format(
          AppUrls.DELETE_EDGE_MODEL_RULE,
          encodeURIComponent(app),
          encodeURIComponent(id),
          encodeURIComponent(rule_type),
          encodeURIComponent(updated_by),
          encodeURIComponent(rule_type_id)
        ),
      { params }
    );
  }

  deployCloudModelRule(app, modelName, ruleModelId, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    console.log(params);
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.DEPLOY_CLOUD_MODEL_RULE,
          encodeURIComponent(app),
          encodeURIComponent(modelName),
          encodeURIComponent(ruleModelId)
        ),
      {},
      { params }
    );
  }
  deployModelEdgeRule(app, assetModelId, ruleId, bodyObj, filterObj) {
    let params = new HttpParams();
    Object.keys(filterObj).forEach((key) => {
      if (filterObj[key]) {
        params = params.set(key, filterObj[key]);
      }
    });
    return this.http.post(
      this.url +
        String.Format(
          AppUrls.DEPLOY_EDGE_RULE,
          encodeURIComponent(app),
          encodeURIComponent(assetModelId),
          encodeURIComponent(ruleId)
        ),
      bodyObj,
      { params }
    );
  }
}
