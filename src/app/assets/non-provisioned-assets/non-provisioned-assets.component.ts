import { Component, OnInit } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AssetModel } from './non-provisioned-assets.model';
declare var $: any;

@Component({
  selector: 'app-non-provisioned-assets',
  templateUrl: './non-provisioned-assets.component.html',
  styleUrls: ['./non-provisioned-assets.component.css']
})
export class NonProvisionedAssetsComponent implements OnInit {

  tileData: any;
  contextApp: any;
  nonProvisionedAssetsList: any[] = [];
  tableConfig: any;
  isEdit = false;
  hierarchyArr: any[] = [];
  appUsers: any[] = [];
  subscriptions: any[] = [];
  deviceTypes: any[] = [];
  configureHierarchy = {};
  selectedAsset: any;
  userData: any;
  assetModel: AssetModel = new AssetModel();

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService,
    private assetModelService: AssetModelService,
  ) { }

  async ngOnInit() {
    this.contextApp = this.commonService.getItemFromLocalStorage(
      CONSTANTS.SELECTED_APP_DATA
    );
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.getApplicationUsers();
    this.getThingsModels();
    await this.getTileName();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }

    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfAddDeviceHierarchy(index);
        }
      }
    });
  }


  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Non-provisioned Assets') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = {};
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    // this.currentLimit = Number(this.tileData[2]?.value) || 20;
    this.getNonProvisionedAssets();
  }

  getNonProvisionedAssets() {
    this.assetService.getNonProvisionedAssets(this.contextApp.app).subscribe((response: any) => {
      this.nonProvisionedAssetsList = response.data;
    });
  }

  editAssetModel(asset) {
    this.selectedAsset = asset;
    $('#editAssetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getApplicationUsers() {
    this.appUsers = [];
    this.subscriptions.push(this.applicationService.getApplicationUsers(this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.appUsers = response.data;
        }
      }
    ));
  }

  getThingsModels() {
    this.deviceTypes = [];
    const obj = {
      app: this.contextApp.app,
      model_type: CONSTANTS.IP_GATEWAY
    };
    this.subscriptions.push(this.assetModelService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.deviceTypes = response.data;
        }
      }
    ));
  }

  onChangeOfAddDeviceHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  closeAssetModal() {
    $('#editAssetModal').modal('hide');
  }

  updateAsset() {
    this.assetModel.app = this.contextApp.app;
    this.assetModel.hierarchy = JSON.stringify({App: this.contextApp.app});
    this.assetModel.hierarchy_json = { App: this.contextApp.app}
    this.assetModel.type = this.selectedAsset.type;
    Object.keys(this.configureHierarchy).forEach((key) => {
      this.assetModel.hierarchy_json[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
    });
    this.assetModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
    console.log(this.assetModel);
    let tags = {
      'tags' : this.assetModel
    }
    this.assetService.updateNonProvisionedAsset(this.contextApp.app, this.selectedAsset.asset_id, tags).subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Update Asset');
      $('#editAssetModal').modal('hide');
      this.assetModel = new AssetModel();
      this.getNonProvisionedAssets();
    });
  }
}
