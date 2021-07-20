import { ToasterService } from './../../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CONSTANTS } from './../../../../app.constants';
import { CommonService } from 'src/app/services/common.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-gateway-assets-setting',
  templateUrl: './gateway-assets-setting.component.html',
  styleUrls: ['./gateway-assets-setting.component.css']
})
export class GatewayAssetsSettingComponent implements OnInit {

  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  @Input() componentState: any;
  contextApp: any;
  applications = CONSTANTS.DEVICEAPPPS;
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
  constantData = CONSTANTS;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
    this.getAssetsOfGateway();
    } else {
      this.asset.gateway_id = this.asset.configuration?.gateway_id;
      this.selectedAsset = this.asset;
      if (!this.asset.metadata) {
        this.asset.metadata = {};
      }

      if (!this.asset.metadata.measurement_settings) {
        this.asset.metadata.measurement_settings = {
          measurement_frequency: 5
        };
      }
      if (!this.asset.metadata.data_ingestion_settings) {
        this.asset.metadata.data_ingestion_settings = {
          type: 'all_props_at_fixed_interval',
          frequency_in_sec: 10
        };
      }
      if (!this.asset.metadata.telemetry_mode_settings) {
        this.asset.metadata.telemetry_mode_settings = {
          normal_mode_frequency: 60,
          turbo_mode_frequency: 5,
          turbo_mode_timeout_time: 120
        };
      }
      this.asset.settings_enabled = false;
      if (this.asset.metadata?.package_app) {
        this.asset.appObj = this.applications.find(appObj => appObj.name === this.asset.metadata.package_app);
        console.log(this.asset.appObj);
        console.log(this.assetTwin);
        if (this.assetTwin.twin_properties.reported && this.assetTwin.twin_properties.reported[this.asset.appObj.type] &&
          this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]) {
            if (this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].status?.toLowerCase() !== 'running') {
              this.asset.settings_enabled = false;
            } else {
              if (this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration
              && this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name].asset_configuration[this.asset.asset_id]) {
                this.asset.settings_enabled = true;
              } else {
                this.asset.settings_enabled = false;
              }
            }
          }
        }
      this.assets.push(this.asset);
    }
  }

  getAssetsOfGateway() {
    this.isAssetsAPILoading = true;
    this.assets = [];
    const obj = {
      gateway_id: this.asset.asset_id,
      type: CONSTANTS.NON_IP_DEVICE,
    };
    this.subscriptions.push(
      this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data) {
            this.assets = response.data;
            this.assets.forEach(asset => {
              if (!asset.metadata) {
                asset.metadata = {};
              }
              if (!asset.metadata.measurement_settings) {
                asset.metadata.measurement_settings = {
                  measurement_frequency: 5
                };
              }
              if (!asset.metadata.data_ingestion_settings) {
                asset.metadata.data_ingestion_settings = {
                  type: 'all_props_at_fixed_interval',
                  frequency_in_sec: 10
                };
              }
              if (!asset.metadata.telemetry_mode_settings) {
                asset.metadata.telemetry_mode_settings = {
                  normal_mode_frequency: 60,
                  turbo_mode_frequency: 5,
                  turbo_mode_timeout_time: 120
                };
              }
              asset.settings_enabled = false;
              if (asset.metadata?.package_app) {
              asset.appObj = this.applications.find(appObj => appObj.name === asset.metadata.package_app);
              if (this.assetTwin.twin_properties.reported && this.assetTwin.twin_properties.reported[asset.appObj.type] &&
                this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name]) {
                  if (this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].status?.toLowerCase() !== 'running') {
                    asset.settings_enabled = false;
                  } else {
                    if (this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration
                    && this.assetTwin.twin_properties.reported[asset.appObj.type][asset.appObj.name].asset_configuration[asset.asset_id]) {
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
        }, error => this.isAssetsAPILoading = false
      )
    );
  }

  changeTelemetrySetting() {
    const obj = {
      command: 'set_configuration',
      app_name: this.selectedAsset?.metadata?.package_app,
      assets: {}
    };
    console.log(this.telemetrySettings);
    obj.assets[this.selectedAsset.asset_id] = {
      measurement_frequency_in_milli_sec: this.selectedAsset.metadata.measurement_settings.measurement_frequency * 1000,
      turbo_mode_frequency_in_milli_sec: this.selectedAsset.metadata.telemetry_mode_settings.turbo_mode_frequency * 1000,
      turbo_mode_timeout_in_milli_sec: this.selectedAsset.metadata.telemetry_mode_settings.turbo_mode_timeout_time * 1000,
      ingestion_settings_type: this.selectedAsset.metadata.data_ingestion_settings.type,
      ingestion_settings_frequency_in_milli_sec: this.selectedAsset.metadata.telemetry_mode_settings.normal_mode_frequency * 1000
    };
    this.callC2dMethod(obj, 'Change Asset Settings');
  }


  callC2dMethod(obj, type) {
    console.log(obj);
    this.isAPILoading = true;
    this.headerMessage = type;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    const c2dObj = {
      asset_id: this.componentState !== CONSTANTS.NON_IP_DEVICE ? this.asset.asset_id : this.asset.gateway_id,
      message: obj,
      app: this.contextApp.app,
      timestamp:  moment().unix(),
      acknowledge: 'Full',
      expire_in_min: 2880,
      job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
      request_type: obj.command,
      job_type: 'Message',
      sub_job_id: null
    };
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService.sendC2DMessage(c2dObj, this.contextApp.app,
        this.componentState !== CONSTANTS.NON_IP_DEVICE ? this.asset.asset_id : this.asset.gateway_id).subscribe(
        (response: any) => {
          this.displayMsgArr.push({
            message: type + ' request sent to gateway.',
            error: false
          });
          clearInterval(this.c2dResponseInterval);
          this.loadC2DResponse(c2dObj);
        }, error => {
          this.toasterService.showError(error.message, type);
          this.isAPILoading = false;
          this.onModalClose();
          clearInterval(this.c2dResponseInterval);
        }
      )
    );
  }

  loadC2DResponse(c2dObj) {
    const obj = {
      sub_job_id: c2dObj.sub_job_id,
      app: this.contextApp.app,
      from_date: c2dObj.timestamp - 5,
      to_date: moment().unix(),
      epoch: true,
      job_type: 'Message'
    };
    this.subscriptions.push(this.assetService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
      (response: any) => {
        // response.data = this.generateResponse();
        if (response.data?.length > 0 && this.displayMsgArr.length <= response.data.length) {
          for (let i = this.displayMsgArr.length - 1; i < response.data.length; i++) {
            this.displayMsgArr.push({
              message:  response.data[i].asset_id + ': ' + response.data[i]?.payload?.message,
              error: response.data[i]?.payload?.status === 'failure' ? true : false
            });
          }
        }
        if (response.data.length < 1) {
          clearInterval(this.c2dResponseInterval);

          this.c2dResponseInterval = setInterval(
          () => {
            this.loadC2DResponse(c2dObj);
          }, 5000);
        } else {
          clearInterval(this.c2dResponseInterval);
          this.refreshAssetTwin.emit();
          setTimeout(() => {
            this.onModalClose();
            this.isAPILoading = false;
          }, 1000);
        }
      }
      ));
  }

  onModalClose() {
    $('#confirmMessageModal').modal('hide');
    this.isAPILoading = false;
    clearInterval(this.c2dResponseInterval);
    this.telemetrySettings = {};
    this.displayMsgArr = [];
    this.headerMessage = undefined;
  }

  saveGatewaySettings() {
    this.changeTelemetrySetting();
    this.isSaveSettingAPILoading = true;
    const obj = {
      metadata: this.selectedAsset.metadata,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.assetService.updateAssetMetadata(obj, this.contextApp.app, this.selectedAsset.asset_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess('Asset Settings updated successfully.', 'Asset Settings');
        this.assetService.reloadAssetInControlPanelEmitter.emit();
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Asset Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }



}
