import { ApplicationService } from './../../services/application/application.service';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { Asset } from 'src/app/models/asset.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent implements OnInit {

  @Input() tileData: any;
  @Input() componentState: any;
  @Output() getAssetEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() assetDetail: any;
  isCreateAssetAPILoading = false;
  contextApp: any;
  addAssetConfigureHierarchy = {};
  addAssetHierarchyArr: any[] = [];
  constantData = CONSTANTS;
  appUsers: any[] = [];
  @Input() gateways: any[] = [];
  assetModels: any[] = [];
  userData: any;
  subscriptions: any[] = [];
  // setupForm: FormGroup;
  protocolList = CONSTANTS.PROTOCOLS;
  isAssetEditable = false;
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.getApplicationUsers();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.addAssetHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.addAssetConfigureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfAddAssetHierarchy(index);

      }
      }
    });
    this.getThingsModels(this.componentState);
    if (this.assetDetail) {
      console.log(this.assetDetail);
      this.isAssetEditable = true;
      // this.setupFormData(this.assetDetail);
    } else {
    this.assetDetail = new Asset();
    if (!this.assetDetail.metadata) {
    this.assetDetail.metadata = {
      setup_details: {}
    };
    }
    this.assetDetail.tags = {};
    this.assetDetail.tags.app = this.contextApp.app;
    this.assetDetail.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    }
    $('#createAssetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getThingsModels(type) {
    this.assetModels = [];
    const obj = {
      app: this.contextApp.app,
      model_type: type
    };
    this.subscriptions.push(this.assetModelService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.assetModels = response.data;
        }
      }
    ));
  }

  onChangeOfAddAssetHierarchy(i) {
    Object.keys(this.addAssetConfigureHierarchy).forEach(key => {
      if (key > i) {
        delete this.addAssetConfigureHierarchy[key];
      }
    });
    Object.keys(this.addAssetHierarchyArr).forEach(key => {
      if (key > i) {
        this.addAssetHierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.addAssetConfigureHierarchy).forEach((key, index) => {
      if (this.addAssetConfigureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.addAssetConfigureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.addAssetHierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  onChangeThingsModel() {
    if (this.assetDetail.tags.asset_type) {
      const modelObj = this.assetModels.filter(type => type.name === this.assetDetail.tags.asset_type)[0];
      modelObj.tags = {
        cloud_connectivity: modelObj.cloud_connectivity,
        protocol: modelObj.protocol
      };
      const obj = {...this.assetDetail.tags, ...modelObj.tags};
      this.assetDetail.tags = obj;
    }
    // this.setupFormData();
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

  onEditAsset() {
    this.isCreateAssetAPILoading = true;
    // if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
    //   this.assetDetail.metadata.setup_details = this.setupForm.value;
    //   }
    const obj = {
      app : this.contextApp.app,
      metadata: this.assetDetail.metadata
    };
    this.subscriptions.push(this.assetService.updateAssetMetadata(obj, this.contextApp.app, this.assetDetail.asset_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Asset Settings');
        this.getAssetEmit.emit();
        this.onCloseCreateAssetModal();
        this.isCreateAssetAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Asset Settings');
        this.isCreateAssetAPILoading = false;
      }
    ));
  }

  onCreateAsset() {
    if (!this.assetDetail.asset_id || !this.assetDetail.tags.asset_manager ||
      !this.assetDetail.tags.protocol || !this.assetDetail.tags.cloud_connectivity  ) {
        this.toasterService.showError('Please enter all required fields',
        'Create ' + this.componentState);
        return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && !this.assetDetail.gateway_id) {
      this.toasterService.showError('Gateway Selection is compulsory.',
        'Create ' + this.componentState);
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.assetDetail.tags.asset_manager.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Create ' + this.componentState);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && this.assetDetail.asset_id === this.assetDetail.gateway_id) {
      this.toasterService.showError('Gateway and Asset name can not be the same.',
      'Create ' + this.componentState);
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy !== 'Asset ID' &&
    !CONSTANTS.ONLY_NOS_AND_CHARS.test(this.assetDetail.tags.partition_key)) {
      this.toasterService.showError('Partition Key only contains numbers and characters.',
      'Create ' + (this.tileData  ? this.tileData.table_key : ''));
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'Asset ID') {
      this.assetDetail.tags.partition_key = this.assetDetail.asset_id;
    }

    this.isCreateAssetAPILoading = true;
    this.assetDetail.tags.hierarchy_json = { App: this.contextApp.app};
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      this.assetDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] = this.addAssetConfigureHierarchy[key];
    });
    const modelObj = this.assetModels.filter(type => type.name === this.assetDetail.tags.asset_type)[0];
    if (!this.assetDetail.metadata) {
      this.assetDetail.metadata = {};
    }
    this.assetDetail.metadata.telemetry_mode_settings = {
      normal_mode_frequency: modelObj?.telemetry_mode_settings?.normal_mode_frequency || 60,
      turbo_mode_frequency: modelObj?.telemetry_mode_settings?.turbo_mode_frequency || 5,
      turbo_mode_timeout_time: modelObj?.telemetry_mode_settings?.turbo_mode_timeout_time || 120
    };
    this.assetDetail.metadata.data_ingestion_settings = {
      type: modelObj?.data_ingestion_settings?.type || 'all_props_at_fixed_interval',
      frequency_in_sec: modelObj?.data_ingestion_settings?.frequency_in_sec || 10
    };
    this.assetDetail.metadata.measurement_settings = {
      measurement_frequency: modelObj?.measurement_settings?.measurement_frequency || 5
    };
    // if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
    // this.assetDetail.metadata.setup_details = this.setupForm.value;
    // }
    const protocol = this.protocolList.find(protocolObj => protocolObj.name === this.assetDetail.tags.protocol);
    this.assetDetail.metadata.package_app = protocol.metadata?.app;
    this.assetDetail.tags.hierarchy = JSON.stringify(this.assetDetail.tags.hierarchy_json );
    this.assetDetail.tags.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.assetDetail.app = this.contextApp.app;
    delete this.assetDetail.tags.reserved_tags;
    this.assetDetail.tags.category = this.componentState === CONSTANTS.NON_IP_DEVICE ?
    null : this.componentState;
    // this.assetDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    this.assetDetail.tags.asset_users = {};
    this.assetDetail.tags.asset_users[btoa(this.assetDetail.tags.asset_manager.user_email)] = {
      user_email: this.assetDetail.tags.asset_manager.user_email,
      user_name: this.assetDetail.tags.asset_manager.user_name
    };
    const obj = JSON.parse(JSON.stringify(this.assetDetail));
    obj.tags.asset_manager = this.assetDetail.tags.asset_manager.user_email;
    obj.tags.email_recipients = obj.tags.asset_manager;
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.assetService.createNonIPAsset(obj, this.contextApp.app)
    : this.assetService.createAsset(obj, this.contextApp.app);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if ( this.componentState === CONSTANTS.NON_IP_DEVICE) {
          this.updateGatewayTags(this.assetDetail);
        } else {
        this.isCreateAssetAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + (this.tileData  ? this.tileData.table_key : ''));
        this.getAssetEmit.emit();
        this.onCloseCreateAssetModal();
      }
      }, error => {
        this.isCreateAssetAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + (this.tileData  ? this.tileData.table_key : ''));
        // this.onCloseCreateAssetModal();
      }
    ));
  }

  updateGatewayTags(assetObj) {
    const obj = {
      asset_id: assetObj.asset_id,
      partition_key: assetObj.tags.partition_key,
      model_id: assetObj.tags.asset_type
    };
    // obj.partition_key[assetObj.asset_id] = assetObj.tags.partition_key;
    this.subscriptions.push(this.assetService.attachLegacyAssetToGateway(this.contextApp.app, assetObj.gateway_id, obj).subscribe(
      (response: any) => {
        this.isCreateAssetAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + this.componentState);
        this.getAssetEmit.emit();
        this.onCloseCreateAssetModal();
      }, error => {
        this.isCreateAssetAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + this.componentState);
        // this.onCloseCreateAssetModal();
      }
    ));
  }

  onCloseCreateAssetModal() {
    $('#createAssetModal').modal('hide');
    this.cancelModal.emit();
    this.assetDetail = undefined;
  }

}
