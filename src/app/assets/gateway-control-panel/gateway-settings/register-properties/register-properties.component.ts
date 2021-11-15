import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Output, OnDestroy } from '@angular/core';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { resolve } from 'dns';

declare var $: any;
@Component({
  selector: 'app-register-properties',
  templateUrl: './register-properties.component.html',
  styleUrls: ['./register-properties.component.css'],
})
export class RegisterPropertiesComponent implements OnInit, OnDestroy {
  @Input() assetTwin: any;
  @Input() asset: any;
  @Input() pageType: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() componentstate: any;
  assets: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  isAssetsAPILoading = false;
  optionsValue: any = {};
  selectedAsset: any;
  displyaMsgArr: any[] = [];
  isAPILoading = false;
  headerMessage: any;
  c2dResponseInterval: any;
  showPropOptions = false;
  properties: any;
  alertConditions: any[] = [];
  applications = CONSTANTS.ASSETAPPPS;
  assetModels: any[] = [];
  c2dJobFilter: any = {};
  rules: any[] = [];
  slaveData: any[] = [];
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService
  ) {}

  async ngOnInit(): Promise<void> {
    console.log(JSON.stringify(this.assetTwin));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.c2dJobFilter.job_type = 'Message';
    if (this.pageType === 'Register Properties') {
      this.c2dJobFilter.request_type = 'Sync Properties/Alerts';
      await this.getAssetsModels();
    } else if (this.pageType === 'Register Rules') {
      this.c2dJobFilter.request_type = 'Sync Rules';
    } else if (this.pageType === 'Register Slaves') {
      this.c2dJobFilter.request_type = 'Sync Slaves';
    }
    if (this.componentstate === CONSTANTS.IP_GATEWAY) {
      this.getAssetsOfGateway();
    } else {
      this.assetModels.forEach((model) => {
        if (this.asset.asset_model === model.name) {
          this.asset.model_freeze = model.freezed;
        }
      });
      this.asset.register_enabled = false;
      if (this.asset.metadata?.package_app) {
        this.asset.appObj = this.applications.find((appObj) => appObj.name === this.asset.metadata.package_app);
        console.log(this.asset.appObj);
        console.log(this.assetTwin);
        if (
          this.assetTwin &&
          this.assetTwin.twin_properties.reported &&
          this.assetTwin.twin_properties.reported[this.asset.appObj.type] &&
          this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
        ) {
          if (
            this.assetTwin.twin_properties.reported[this.asset.appObj.type][
              this.asset.appObj.name
            ].status?.toLowerCase() !== 'running'
          ) {
            this.asset.register_enabled = false;
          } else {
            if (
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration &&
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration[this.asset.asset_id]
            ) {
              this.asset.register_enabled = true;
            } else {
              this.asset.register_enabled = false;
            }
          }
        }
      }
      this.assets.push(this.asset);
    }
  }

  getAssetsModels() {
    return new Promise<void>((resolve1, reject) => {
      this.assetModels = [];
      const obj = {
        app: this.contextApp.app,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelsList(obj).subscribe((response: any) => {
          if (response && response.data) {
            this.assetModels = response.data;
          }
          resolve1();
        })
      );
    });
  }

  getAssetsOfGateway() {
    this.isAssetsAPILoading = true;
    this.assets = [];
    const obj = {
      gateway_id: this.assetTwin.asset_id,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.subscriptions.push(
      this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            // this.assets = response.data;
            response.data.forEach((asset) => {
              this.assetModels.forEach((model) => {
                if (asset.asset_model === model.name) {
                  asset.model_freeze = model.freezed;
                }
              });
              asset.register_enabled = false;
              if (asset.metadata?.package_app) {
                asset.appObj = this.applications.find((appObj) => appObj.name === asset.metadata.package_app);
                if (
                  this.assetTwin.twin_properties.reported &&
                  this.assetTwin.twin_properties.reported[asset.appObj.type] &&
                  this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]
                ) {
                  if (
                    this.assetTwin.twin_properties.reported[asset.appObj.type][
                      asset.appObj.name
                    ].status?.toLowerCase() !== 'running'
                  ) {
                    asset.register_enabled = false;
                  } else {
                    if (
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]
                        .asset_configuration &&
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration[
                        asset.asset_id
                      ]
                    ) {
                      asset.register_enabled = true;
                    } else {
                      asset.register_enabled = false;
                    }
                  }
                }
              }
            });
            this.assets = response.data;
          }
          this.isAssetsAPILoading = false;
        },
        (error) => (this.isAssetsAPILoading = false)
      )
    );
  }

  onRegisterBtnClick(asset) {
    if (this.pageType === 'Register Properties') {
      this.openRegisterPropModal(asset);
    } else if (this.pageType === 'Register Rules') {
      this.registerRules(asset);
    } else if (this.pageType === 'Register Slaves') {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaa');
      this.syncSlaves(asset);
    }
  }

  openRegisterPropModal(asset) {
    this.selectedAsset = asset;
    this.showPropOptions = true;
    this.optionsValue = {};
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getAssetsModelProperties() {
    return new Promise<void>((resolve1, reject) => {
      const obj = {
        app: this.contextApp.app,
        name: this.selectedAsset.asset_model || this.selectedAsset.tags?.asset_model,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelProperties(obj).subscribe(
          (response: any) => {
            response.properties.measured_properties = response.properties.measured_properties
              ? response.properties.measured_properties
              : [];
            response.properties.edge_derived_properties = response.properties.edge_derived_properties
              ? response.properties.edge_derived_properties
              : [];
            response.properties.configurable_properties = response.properties.configurable_properties
              ? response.properties.configurable_properties
              : [];
            response.properties.controllable_properties = response.properties.controllable_properties
              ? response.properties.controllable_properties
              : [];
            this.properties = response.properties;
            resolve1();
          },
          (error) => reject()
        )
      );
    });
  }

  getAlertConditions() {
    return new Promise<void>((resolve1, reject) => {
      const filterObj = {
        asset_model: this.selectedAsset.asset_model || this.selectedAsset.tags?.asset_model,
        source: 'Asset',
      };
      this.subscriptions.push(
        this.assetModelService.getAlertConditions(this.contextApp.app, filterObj).subscribe(
          (response: any) => {
            if (response?.data) {
              this.alertConditions = response.data;
              resolve1();
            }
          },
          (error) => reject()
        )
      );
    });
  }

  getEdgeRules(asset) {
    return new Promise<void>((resolve1, reject) => {
      this.rules = [];
      this.isAPILoading = true;
      const obj = {
        type: 'Edge',
      };
      this.subscriptions.push(
        this.assetService.getRules(this.contextApp.app, asset.asset_id, obj).subscribe(
          (response: any) => {
            if (response?.data) {
              this.rules = response.data;
              console.log(this.rules);
            }
            resolve1();
          },
          (error) => (this.isAPILoading = false)
        )
      );
    });
  }

  async registerRules(asset) {
    await this.getEdgeRules(asset);
    const obj = {
      asset_id: asset.asset_id,
      message: {
        command: 'set_asset_rules',
        rules: this.rules,
      },
      app: this.contextApp.app,
      timestamp: moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: 'Sync Rules',
      job_type: 'Message',
      sub_job_id: null,
    };
    obj.sub_job_id = obj.job_id + '_1';
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(
          obj,
          this.contextApp.app,
          asset.type !== CONSTANTS.NON_IP_ASSET ? asset.asset_id : asset.gateway_id
        )
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Sync Rules');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Sync Rules');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          }
        )
    );
  }

  getSlaveData(asset) {
    return new Promise<void>((resolve1, reject) => {
      this.slaveData = [];
      const obj = {};
      this.subscriptions.push(
        this.assetService.getAssetSlaveDetails(this.contextApp.app, asset.asset_id, obj).subscribe(
          (response: any) => {
            if (response.data) {
              this.slaveData = response.data;
            }
            resolve1();
          },
          (error) => resolve1()
        )
      );
    });
  }

  async syncSlaves(asset) {
    this.isAPILoading = true;
    await this.getSlaveData(asset);
    const c2dObj = {
      asset_id: asset.asset_id,
      job_id: asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: 'Sync Slaves',
      job_type: 'Message',
      sub_job_id: null,
      message: null,
    };
    const obj = {
      command: 'register_slaves',
      slaves: {},
    };
    this.slaveData.forEach((slave) => {
      slave.metadata.mac_id = slave.mac_id;
      obj.slaves[slave.slave_id] = slave.metadata;
      obj.slaves[slave.slave_id]['category'] = slave.slave_category?.slave_category;
    });
    c2dObj.message = obj;
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(
          c2dObj,
          this.contextApp.app,
          asset.type !== CONSTANTS.NON_IP_ASSET ? asset.asset_id : asset.gateway_id
        )
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Sync Slaves');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Sync Slaves');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          }
        )
    );
  }

  async registerProperties() {
    let count = 0;
    Object.keys(this.optionsValue).forEach((key) => {
      if (!this.optionsValue[key]) {
        count++;
      }
    });
    if (count === 2) {
      this.toasterService.showError('Please select options to register', 'Register Properties/Alerts');
      return;
    }
    this.isAPILoading = true;
    this.showPropOptions = false;
    if (this.optionsValue?.measured_properties || this.optionsValue.edge_derived_properties) {
      await this.getAssetsModelProperties();
    }
    if (this.optionsValue.alerts) {
      await this.getAlertConditions();
    }
    const obj = {
      asset_id: this.selectedAsset.asset_id,
      command: 'set_properties',
      measured_properties: this.optionsValue?.measured_properties ? {} : undefined,
      alerts: this.optionsValue.alerts ? {} : undefined,
      // controllable_properties: this.optionsValue.controllable_properties ? {} : undefined,
      // configurable_properties: this.optionsValue.configurable_properties ? {} : undefined,
      edge_derived_properties: this.optionsValue.edge_derived_properties ? {} : undefined,
    };
    if (this.optionsValue.measured_properties) {
      this.properties.measured_properties.forEach((prop) => {
        obj.measured_properties[prop.json_key] = prop?.metadata || {};
        obj.measured_properties[prop.json_key].g = prop.group;
      });
    }
    if (this.optionsValue.alerts) {
      this.alertConditions.forEach((prop) => {
        obj.alerts[prop.code] = prop.metadata;
      });
    }
    if (this.optionsValue.edge_derived_properties) {
      this.properties.edge_derived_properties.forEach((prop) => {
        obj.edge_derived_properties[prop.json_key] = prop?.metadata || {};
        obj.edge_derived_properties[prop.json_key].g = prop.group;
      });
    }
    // if (this.optionsValue.controllable_properties) {
    //   this.properties.controllable_properties.forEach(prop => {
    //     obj.controllable_properties[prop.json_key] = prop.metadata;
    //   });
    // }
    this.callC2dMethod(obj);
  }

  callC2dMethod(obj) {
    console.log(obj);
    this.isAPILoading = true;
    const c2dObj = {
      asset_id: this.selectedAsset.asset_id,
      message: obj,
      app: this.contextApp.app,
      timestamp: moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.selectedAsset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: 'Sync Properties/Alerts',
      job_type: 'Message',
      sub_job_id: null,
    };
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(
          c2dObj,
          this.contextApp.app,
          this.selectedAsset.type !== CONSTANTS.NON_IP_ASSET
            ? this.selectedAsset.asset_id
            : this.selectedAsset.gateway_id
        )
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(
              'Asset properties/alert registration request sent to gateway',
              'Register Properties/Alerts'
            );
            this.assetService.refreshRecentJobs.emit();
            this.onModalClose();
            this.isAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Register Properties/Alerts');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
            clearInterval(this.c2dResponseInterval);
          }
        )
    );
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.selectedAsset = undefined;
    this.isAPILoading = false;
    clearInterval(this.c2dResponseInterval);
    this.displyaMsgArr = [];
    this.headerMessage = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    clearInterval(this.c2dResponseInterval);
  }
}
