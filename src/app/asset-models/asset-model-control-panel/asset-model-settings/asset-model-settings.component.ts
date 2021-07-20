import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-asset-model-settings',
  templateUrl: './asset-model-settings.component.html',
  styleUrls: ['./asset-model-settings.component.css']
})
export class AssetModelSettingsComponent implements OnInit {

  @Input() assetModel: any;
  originalAssetModel: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  isSaveSettingAPILoading = false;
  isSettingsEditable = false;
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.assetModel = JSON.parse(JSON.stringify(this.assetModel));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetModelDetail();
  }

  getAssetModelDetail() {
    return new Promise<void>((resolve) => {
    const obj = {
      name: this.assetModel.name,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.assetModelService.getThingsModelDetails(obj.app, obj.name).subscribe(
      (response: any) => {
        if (response) {
          this.assetModel = response;
          this.assetModel.name = obj.name;
          this.assetModel.app = obj.app;
          if (!this.assetModel.tags.reserved_tags) {
            this.assetModel.tags.reserved_tags = [];
          }
          if (!this.assetModel.metadata.telemetry_mode_settings) {
            this.assetModel.metadata.telemetry_mode_settings = {
              normal_mode_frequency: 60,
              turbo_mode_frequency: 5,
              turbo_mode_timeout_time: 120
            };
          }
          if (!this.assetModel.metadata.data_ingestion_settings) {
            this.assetModel.metadata.data_ingestion_settings = {
              type: 'all_props_at_fixed_interval',
              frequency_in_sec: 10
            };
          }
          if (!this.assetModel.metadata.measurement_settings) {
            this.assetModel.metadata.measurement_settings = {
              measurement_frequency: 5
            };
          }
          this.originalAssetModel = JSON.parse(JSON.stringify(this.assetModel));
        }
        resolve();
      }
    ));
  });
  }

  onCancelClick() {
    this.isSettingsEditable = false;
    this.assetModel = JSON.parse(JSON.stringify(this.originalAssetModel));
  }

  saveSettings() {
    if (this.assetModel.metadata.measurement_settings.measurement_frequency <= 0) {
      this.toasterService.showError('Measurement frequency should be greater than 0', 'Model Settings');
      return;
    }
    if (this.assetModel.metadata.telemetry_mode_settings.normal_mode_frequency <= 0 || this.assetModel.metadata.telemetry_mode_settings.turbo_mode_frequency <= 0 ||
      this.assetModel.metadata.telemetry_mode_settings.turbo_mode_timeout_time <= 0) {
        this.toasterService.showError('Telemtry frequency values should be greater than 0', 'Model Settings');
        return;
    }
    this.isSaveSettingAPILoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.app = this.contextApp.app;
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(this.assetModelService.updateThingsModel(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Model Settings');
        this.getAssetModelDetail();
        this.isSaveSettingAPILoading = false;
        this.isSettingsEditable = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Model Settings');
        this.isSaveSettingAPILoading = false;
      }
    ));
  }

}
