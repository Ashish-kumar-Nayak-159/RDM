import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-asset-model-settings',
  templateUrl: './asset-model-settings.component.html',
  styleUrls: ['./asset-model-settings.component.css'],
})
export class AssetModelSettingsComponent implements OnInit {
  @Input() assetModel: any;
  originalAssetModel: any;
  subscriptions: Subscription[] = [];
  contextApp: any;
  userData: any;
  isSaveSettingAPILoading = false;
  isSettingsEditable = false;
  decodedToken: any;
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.assetModel = JSON.parse(JSON.stringify(this.assetModel));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getAssetModelDetail();
  }

  getAssetModelDetail() {
    return new Promise<void>((resolve) => {
      const obj = {
        name: this.assetModel.name,
        app: this.contextApp.app,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelDetails(obj.app, obj.name).subscribe((response: any) => {
          if (response) {
            this.assetModel = response;
            this.assetModel.name = obj.name;
            this.assetModel.app = obj.app;
            if (!this.assetModel.tags.reserved_tags) {
              this.assetModel.tags.reserved_tags = [];
            }
            if (!this.assetModel.metadata.telemetry_mode_settings) {
              this.assetModel.metadata.telemetry_mode_settings = {
                turbo_mode_timeout_time: 120,
                g1_turbo_mode_frequency_in_ms: 60,
                g2_turbo_mode_frequency_in_ms: 120,
                g3_turbo_mode_frequency_in_ms: 180,
                g1_ingestion_frequency_in_ms: 600,
                g2_ingestion_frequency_in_ms: 1200,
                g3_ingestion_frequency_in_ms: 1800,
              };
            }
            if (!this.assetModel.metadata.data_ingestion_settings) {
              this.assetModel.metadata.data_ingestion_settings = {
                type: 'all_props_at_fixed_interval',
              };
            }
            if (!this.assetModel.metadata.measurement_settings) {
              this.assetModel.metadata.measurement_settings = {
                g1_measurement_frequency_in_ms: 60,
                g2_measurement_frequency_in_ms: 120,
                g3_measurement_frequency_in_ms: 180,
              };
            }
            this.originalAssetModel = JSON.parse(JSON.stringify(this.assetModel));
          }
          resolve();
        })
      );
    });
  }

  onCancelClick() {
    this.isSettingsEditable = false;
    this.assetModel = JSON.parse(JSON.stringify(this.originalAssetModel));
  }

  saveSettings() {
    if (
      this.assetModel.metadata.measurement_settings.g1_measurement_frequency_in_ms <= 0 ||
      this.assetModel.metadata.measurement_settings.g2_measurement_frequency_in_ms <= 0 ||
      this.assetModel.metadata.measurement_settings.g3_measurement_frequency_in_ms <= 0
    ) {
      this.toasterService.showError('Measurement frequency should be greater than 0', 'Model Settings');
      return;
    }
    // to do -  key changes based on groups
    if (
      this.assetModel.metadata.telemetry_mode_settings.normal_mode_frequency <= 0 ||
      this.assetModel.metadata.telemetry_mode_settings.turbo_mode_frequency <= 0 ||
      this.assetModel.metadata.telemetry_mode_settings.turbo_mode_timeout_time <= 0
    ) {
      this.toasterService.showError('Telemtry frequency values should be greater than 0', 'Model Settings');
      return;
    }
    this.isSaveSettingAPILoading = true;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.app = this.contextApp.app;
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.contextApp.app).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Update Model Settings');
          this.getAssetModelDetail();
          this.isSaveSettingAPILoading = false;
          this.isSettingsEditable = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Update Model Settings');
          this.isSaveSettingAPILoading = false;
        }
      )
    );
  }
}
