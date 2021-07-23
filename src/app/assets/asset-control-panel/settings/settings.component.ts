import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from './../../../services/assets/asset.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {

  @Input() asset = new Asset();
  originalAsset = new Asset();
  assetModel: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  isSaveSettingAPILoading = false;
  isSettingsEditable = false;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService
  ) { }

  async ngOnInit(): Promise<void> {
    const asset = JSON.parse(JSON.stringify(this.asset));
    this.asset = undefined;
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getAssetModelDetail(asset);
    this.getAssetData(asset);
  }

  getAssetModelDetail(asset) {
    return new Promise<void>((resolve) => {
    const obj = {
      name: asset.tags.asset_model,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelDetails(obj.app, obj.name).subscribe(
      (response: any) => {
        if (response) {
          this.assetModel = response;
          this.assetModel.name = obj.name;
          this.assetModel.app = obj.app;
          if (!this.assetModel.tags.reserved_tags) {
            this.assetModel.tags.reserved_tags = [];
          }
          if (!this.assetModel.metadata) {
            this.assetModel.metdata = {};
          }
          if (!this.assetModel.metadata.measurement_settings) {
            this.assetModel.metadata.measurement_settings = {
              measurement_frequency: 5
            };
          }
          if (!this.assetModel.metadata.data_ingestion_settings) {
            this.assetModel.metadata.data_ingestion_settings = {
              type: 'all_props_at_fixed_interval',
              frequency_in_sec: 10
            };
          }
          if (!this.assetModel.metadata.telemetry_mode_settings) {
            this.assetModel.metadata.telemetry_mode_settings = {
              normal_mode_frequency: 60,
              turbo_mode_frequency: 5,
              turbo_mode_timeout_time: 120
            };
          }
        }
        resolve();
      }
    ));
  });
  }

  getAssetData(asset) {
    // this.asset.tags = undefined;
    this.subscriptions.push(
      this.assetService.getAssetDetailById(this.contextApp.app, asset.asset_id).subscribe(
      async (response: any) => {
        this.asset = JSON.parse(JSON.stringify(response));
        if (!this.asset.metadata) {
          this.asset.metadata = {};
        }
        console.log(this.asset.metadata.measurement_frequency);
        if (!this.asset.metadata.telemetry_mode_settings) {
          this.asset.metadata.telemetry_mode_settings = {
            normal_mode_frequency: 60,
            turbo_mode_frequency: 5,
            turbo_mode_timeout_time: 120
          };
        }
        if (!this.asset.metadata.data_ingestion_settings) {
          this.asset.metadata.data_ingestion_settings = {
            type: 'all_props_at_fixed_interval',
            frequency_in_sec: 10
          };
        }
        if (!this.asset.metadata.measurement_settings) {
          this.asset.metadata.measurement_settings = {
            measurement_frequency: 5
          };
        }
        this.originalAsset = JSON.parse(JSON.stringify(this.asset));
      }));
  }

  onCancelClick() {
    this.isSettingsEditable = false;
    this.asset = JSON.parse(JSON.stringify(this.originalAsset));
  }

  saveSettings() {
    this.isSaveSettingAPILoading = true;
    const tagObj = {};
    const obj = {
      app : this.contextApp.app,
      metadata: this.asset.metadata
    };
    this.subscriptions.push(this.assetService.updateAssetMetadata(obj, this.contextApp.app, this.asset.asset_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Asset Settings');
        this.getAssetData(this.asset);
        this.isSettingsEditable = false;
        this.isSaveSettingAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Asset Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
