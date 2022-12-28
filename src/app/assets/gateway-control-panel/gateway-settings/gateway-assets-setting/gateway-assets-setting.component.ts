import { ToasterService } from './../../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as datefns from 'date-fns';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
declare var $: any;
@Component({
  selector: 'app-gateway-assets-setting',
  templateUrl: './gateway-assets-setting.component.html',
  styleUrls: ['./gateway-assets-setting.component.css'],
})
export class GatewayAssetsSettingComponent implements OnInit {
  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() componentState: any;
  contextApp: any;
  applications = CONSTANTS.ASSETAPPPS;
  isAssetsAPILoading = false;
  assets: any[] = [];
  subscriptions: Subscription[] = [];
  telemetrySettings = {};
  selectedAsset: any;
  displayMsgArr: any[] = [];
  c2dResponseInterval: any;
  isAPILoading = false;
  headerMessage: any;
  isSaveSettingAPILoading = false;
  properties: any;
  propertiesList: any;
  c2dJobFilter: any = {};
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.c2dJobFilter.request_type = 'Sync Configuration,Sync Properties/Alerts';
    this.c2dJobFilter.job_type = 'Message';
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      this.getAssetsOfGateway();
    } else {
      // this.asset.gateway_id = this.asset.configuration?.gateway_id;
      this.selectedAsset = this.asset;
      if (!this.asset.metadata) {
        this.asset.metadata = {};
      }

      if (!this.asset.metadata.measurement_settings) {
        this.asset.metadata.measurement_settings = {
          g1_measurement_frequency_in_ms: 10 * 1000,
          g2_measurement_frequency_in_ms: 10 * 1000,
          g3_measurement_frequency_in_ms: 10 * 1000,
        };
      }
      if (!this.asset.metadata.data_ingestion_settings) {
        this.asset.metadata.data_ingestion_settings = {
          type: 'all_props_at_fixed_interval',
        };
      }
      if (!this.asset.metadata.telemetry_mode_settings) {
        this.asset.metadata.telemetry_mode_settings = {
          turbo_mode_timeout_time: 120 * 1000,
          g1_turbo_mode_frequency_in_ms: 10 * 1000,
          g2_turbo_mode_frequency_in_ms: 10 * 1000,
          g3_turbo_mode_frequency_in_ms: 10 * 1000,
          g1_ingestion_frequency_in_ms: 60 * 1000,
          g2_ingestion_frequency_in_ms: 60 * 1000,
          g3_ingestion_frequency_in_ms: 60 * 1000,
        };
      }
      this.asset.settings_enabled = false;
      if (this.asset.metadata?.package_app) {
        this.asset.appObj = this.applications.find((appObj) => appObj.name === this.asset.metadata.package_app);
        if (
          this.assetTwin.twin_properties.reported &&
          this.assetTwin.twin_properties.reported[this.asset.appObj.type] &&
          this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
        ) {
          if (
            this.assetTwin.twin_properties.reported[this.asset.appObj.type][
              this.asset.appObj.name
            ].status?.toLowerCase() !== 'running'
          ) {
            this.asset.settings_enabled = false;
          } else {
            if (
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration &&
              this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                .asset_configuration[this.asset.asset_id]
            ) {
              this.asset.settings_enabled = true;
            } else {
              this.asset.settings_enabled = false;
            }
          }
        }
      }
      this.assets.push(this.asset);
      this.selectedAsset = this.asset;
    }
  }

  getAssetsOfGateway() {
    this.isAssetsAPILoading = true;
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      type: CONSTANTS.NON_IP_ASSET,
    };
    this.subscriptions.push(
      this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            this.assets = response.data;
            if (this.assets.length > 0) {
              this.selectedAsset = this.assets[0];
            }
            this.assets.forEach((asset) => {
              if (!asset.metadata) {
                asset.metadata = {};
              }
              if (!asset.metadata.measurement_settings) {
                asset.metadata.measurement_settings = {
                  g1_measurement_frequency_in_ms: 10 * 1000,
                  g2_measurement_frequency_in_ms: 10 * 1000,
                  g3_measurement_frequency_in_ms: 10 * 1000,
                };
              }
              if (!asset.metadata.data_ingestion_settings) {
                asset.metadata.data_ingestion_settings = {
                  type: 'all_props_at_fixed_interval',
                };
              }
              if (!asset.metadata.telemetry_mode_settings) {
                asset.metadata.telemetry_mode_settings = {
                  turbo_mode_timeout_time: 120 * 1000,
                  g1_turbo_mode_frequency_in_ms: 10 * 1000,
                  g2_turbo_mode_frequency_in_ms: 10 * 1000,
                  g3_turbo_mode_frequency_in_ms: 10 * 1000,
                  g1_ingestion_frequency_in_ms: 60 * 1000,
                  g2_ingestion_frequency_in_ms: 60 * 1000,
                  g3_ingestion_frequency_in_ms: 60 * 1000,
                };
              }
              asset.settings_enabled = false;
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
                    asset.settings_enabled = false;
                  } else {
                    if (
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]
                        .asset_configuration &&
                      this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration[
                        asset.asset_id
                      ]
                    ) {
                      asset.settings_enabled = true;
                    } else {
                      asset.settings_enabled = false;
                    }
                  }
                }
              }
            });
          }
          this.isAssetsAPILoading = false;
        },
        (error) => (this.isAssetsAPILoading = false)
      )
    );
  }

  async changeTelemetrySetting() {
    const obj = {
      command: 'set_asset_configuration',
      app_name: this.selectedAsset?.metadata?.package_app,
      asset_id: this.selectedAsset.asset_id,
      g1_measurement_frequency_in_ms:
        this.selectedAsset.metadata.measurement_settings.g1_measurement_frequency_in_ms,
      g2_measurement_frequency_in_ms:
        this.selectedAsset.metadata.measurement_settings.g2_measurement_frequency_in_ms ,
      g3_measurement_frequency_in_ms:
        this.selectedAsset.metadata.measurement_settings.g3_measurement_frequency_in_ms,

      g1_turbo_mode_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g1_turbo_mode_frequency_in_ms,
      g2_turbo_mode_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g2_turbo_mode_frequency_in_ms,
      g3_turbo_mode_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g3_turbo_mode_frequency_in_ms,

      turbo_mode_timeout_in_ms: this.selectedAsset.metadata.telemetry_mode_settings.turbo_mode_timeout_time,
       ingestion_settings_type: this.selectedAsset.metadata.data_ingestion_settings.type,

      g1_ingestion_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g1_ingestion_frequency_in_ms,
      g2_ingestion_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g2_ingestion_frequency_in_ms,
      g3_ingestion_frequency_in_ms:
        this.selectedAsset.metadata.telemetry_mode_settings.g3_ingestion_frequency_in_ms,
    };
    await this.callC2dMethod(obj, 'Change Asset Settings');
  }

  callC2dMethod(obj, type) {
    return new Promise<void>((resolve1, reject) => {
      this.isAPILoading = true;
      this.headerMessage = type;
      const c2dObj = {
        asset_id: this.selectedAsset.asset_id,
        message: obj,
        app: this.contextApp.app,
        timestamp: datefns.getUnixTime(new Date()),
        acknowledge: 'Full',
        expire_in_min: 2880,
        job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
        request_type: obj.command === 'set_asset_configuration' ? 'Sync Configuration' : 'Sync Properties/Alerts',
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
              this.toasterService.showSuccess('Request sent to gateway', type);
              this.assetService.refreshRecentJobs.emit();
              resolve1();
            },
            (error) => {
              this.toasterService.showError(error.message, type);
              this.assetService.refreshRecentJobs.emit();
              this.isAPILoading = false;
              clearInterval(this.c2dResponseInterval);
            }
          )
      );
    });
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.isAPILoading = false;
    clearInterval(this.c2dResponseInterval);
    this.telemetrySettings = {};
    this.displayMsgArr = [];
    this.headerMessage = undefined;
  }

  async saveGatewaySettings() {
    await this.changeTelemetrySetting();
    // this.registerProperties();
    this.isSaveSettingAPILoading = true;
    const obj = {
      metadata: this.selectedAsset.metadata,
      app: this.contextApp.app,
    };
    this.subscriptions.push(
      this.assetService.updateAssetMetadata(obj, this.contextApp.app, this.selectedAsset.asset_id).subscribe(
        (response: any) => {
          // this.toasterService.showSuccess('Asset Settings updated successfully.', 'Asset Settings');
          this.assetService.reloadAssetInControlPanelEmitter.emit();
          this.assetService.refreshRecentJobs.emit();
          this.isSaveSettingAPILoading = false;
          this.isAPILoading = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Asset Settings');
          this.isSaveSettingAPILoading = false;
        }
      )
    );
  }

  async openGroupPropertyModel() {
    await this.getAssetsModelProperties();
    $('#groupProperyModel').modal({ backdrop: 'static', keyboard: false, show: true });
    if(this.assetTwin.twin_properties){
      if (
        this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration &&
        this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration[
          this.asset.asset_id
        ] &&
        this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration[
          this.asset.asset_id
        ].properties
      ) {
        this.properties =
          this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration[
            this.asset.asset_id
          ].properties;
      } else {
        this.propertiesList.measured_properties.forEach((prop) => {
          this.properties['measured_properties'][prop.json_key] = prop.group;
        });
        this.propertiesList.edge_derived_properties.forEach((prop) => {
          this.properties['edge_derived_properties'][prop.json_key] = prop.group;
        });
      }
    }
  }

  onPropertyModalClose() {
    $('#groupProperyModel').modal('hide');
  }

  registerProperties() {
    this.isAPILoading = true;
    const obj = {
      asset_id: this.selectedAsset.asset_id,
      command: 'set_properties',
      measured_properties: {},
      edge_derived_properties: {},
    };
    this.propertiesList.measured_properties.forEach((prop) => {
      obj.measured_properties[prop.json_key] = prop.metadata;
      obj.measured_properties[prop.json_key]['g'] = this.properties[prop.json_key];
    });
    this.propertiesList.edge_derived_properties.forEach((prop) => {
      obj.edge_derived_properties[prop.json_key] = prop.metadata;
      obj.measured_properties[prop.json_key]['g'] = this.properties[prop.json_key];
    });
    this.callC2dMethod(obj, 'Register Properties');
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
            this.propertiesList = response.properties;
            resolve1();
          },
          (error) => reject()
        )
      );
    });
  }

  updatePropertyData() {
  }
}
