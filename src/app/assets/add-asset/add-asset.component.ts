import { ApplicationService } from './../../services/application/application.service';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, Input, OnInit, EventEmitter, Output, OnChanges } from '@angular/core';
import * as moment from 'moment';
import { Asset } from 'src/app/models/asset.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;
@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css'],
})
export class AddAssetComponent implements OnInit, OnChanges {
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
  originalGateways: any[] = [];
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
  ) {}

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
    await this.getApplicationUsers();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.addAssetHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        if (this.assetDetail?.hierarchy) {
          this.addAssetConfigureHierarchy[index] = this.assetDetail.hierarchy[level];
          if (this.assetDetail.hierarchy[level]) {
            this.onChangeOfAddAssetHierarchy(index);
          }
        } else {
          this.addAssetConfigureHierarchy[index] = this.contextApp.user.hierarchy[level];
          if (this.contextApp.user.hierarchy[level]) {
            this.onChangeOfAddAssetHierarchy(index);
          }
        }
      }
    });

    await this.getAssetsModels(this.componentState);
    if (this.assetDetail) {
      this.isAssetEditable = true;
      this.assetDetail.tags = {};
      if (!this.assetDetail.display_name) {
        this.assetDetail.tags.display_name = this.assetDetail.asset_id;
      } else {
        this.assetDetail.tags.display_name = this.assetDetail.display_name;
      }
      if (!this.assetDetail.asset_manager) {
        this.assetDetail.tags.asset_manager = undefined;
      } else {
        this.assetDetail.tags.asset_manager = this.assetDetail.asset_manager;
      }
      if (!this.assetDetail.asset_model) {
        this.assetDetail.tags.asset_model = null;
      } else {
        this.assetDetail.tags.asset_model = this.assetDetail.asset_model;
        const modelObj = this.assetModels.filter((type) => type.name === this.assetDetail.tags.asset_model)[0];
        modelObj.tags = {
          cloud_connectivity: modelObj.cloud_connectivity,
          protocol: modelObj.protocol,
        };
        const obj = { ...this.assetDetail.tags, ...modelObj.tags };
        this.assetDetail.tags = obj;
      }
      this.assetDetail.tags.type = this.assetDetail.type;
    } else {
      this.assetDetail = new Asset();
      if (!this.assetDetail.metadata) {
        this.assetDetail.metadata = {
          setup_details: {},
        };
      }
      this.assetDetail.tags = {};
      this.assetDetail.tags.app = this.contextApp.app;
      this.assetDetail.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    }
    $('#createAssetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  ngOnChanges(changes) {
    if (changes.gateways) {
      this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
    }
  }

  getAssetsModels(type) {
    return new Promise<void>((resolve, reject) => {
      this.assetModels = [];
      const obj = {
        app: this.contextApp.app,
        model_type: type,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelsList(obj).subscribe((response: any) => {
          if (response && response.data) {
            this.assetModels = response.data;
          }
          resolve();
        })
      );
    });
  }

  onChangeOfAddAssetHierarchy(i) {
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.addAssetConfigureHierarchy[key];
      }
    });
    Object.keys(this.addAssetHierarchyArr).forEach((key) => {
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

    const hierarchyObj: any = { App: this.contextApp.app };
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      if (this.addAssetConfigureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.addAssetConfigureHierarchy[key];
      }
    });
    console.log(hierarchyObj);
    console.log(Object.keys(hierarchyObj));
    if (Object.keys(hierarchyObj).length === 1) {
      this.gateways = JSON.parse(JSON.stringify(this.originalGateways));
    } else {
      const arr = [];
      this.gateways = [];
      console.log(hierarchyObj);
      console.log(this.originalGateways);
      this.originalGateways.forEach((asset) => {
        let trueFlag = 0;
        let flaseFlag = 0;

        Object.keys(hierarchyObj).forEach((hierarchyKey) => {
          console.log(asset.hierarchy[hierarchyKey], '===', hierarchyObj[hierarchyKey]);
          if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            trueFlag++;
          } else {
            flaseFlag++;
          }
        });
        if (trueFlag > 0 && flaseFlag === 0) {
          arr.push(asset);
        }
      });
      if (this.assetDetail) {
        this.assetDetail.gateway_id = undefined;
      }
      this.gateways = JSON.parse(JSON.stringify(arr));
    }
    let count = 0;
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      if (this.addAssetConfigureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.addAssetHierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.addAssetHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
    // await this.getAssets(hierarchyObj);
  }

  onChangeAssetsModel() {
    if (this.assetDetail.tags.asset_model) {
      const modelObj = this.assetModels.filter((type) => type.name === this.assetDetail.tags.asset_model)[0];
      modelObj.tags = {
        cloud_connectivity: modelObj.cloud_connectivity,
        protocol: modelObj.protocol,
      };
      const modelTags = {
        "Cloud_Connectivity" : modelObj.cloud_connectivity,
        "Protocol" : modelObj.protocol
      }
      this.assetDetail.tags['model_tags'] = JSON.stringify(modelTags);
      const obj = { ...this.assetDetail.tags, ...modelObj.tags };
      this.assetDetail.tags = obj;
    } else {
      this.assetDetail.tags.cloud_connectivity = undefined;
      this.assetDetail.tags.protocol = undefined;
    }
    // this.setupFormData();
  }

  getApplicationUsers() {
    return new Promise<void>((resolve1, reject) => {
      this.appUsers = [];
      this.subscriptions.push(
        this.applicationService.getApplicationUsers(this.contextApp.app).subscribe((response: any) => {
          if (response && response.data) {
            this.appUsers = response.data;
          }
          resolve1();
        })
      );
    });
  }

  onEditAsset() {
    this.isCreateAssetAPILoading = true;
    // if (this.componentState === CONSTANTS.NON_IP_ASSET) {
    //   this.assetDetail.metadata.setup_details = this.setupForm.value;
    //   }

    const obj = {
      app: this.contextApp.app,
      metadata: this.assetDetail.metadata,
    };
    this.subscriptions.push(
      this.assetService.updateAssetMetadata(obj, this.contextApp.app, this.assetDetail.asset_id).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Update Asset Settings');
          this.getAssetEmit.emit();
          this.onCloseCreateAssetModal();
          this.isCreateAssetAPILoading = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Update Asset Settings');
          this.isCreateAssetAPILoading = false;
        }
      )
    );
  }

  onUpdateAsset() {
    this.isCreateAssetAPILoading = true;
    console.log(this.assetDetail);
    if (
      !this.assetDetail.tags.asset_manager ||
      !this.assetDetail.tags.display_name ||
      !this.assetDetail.tags.asset_model
    ) {
      this.toasterService.showError('All fields are required', 'Non-provisioned Assets');
      this.isCreateAssetAPILoading = false;
      return;
    }
    this.assetDetail.tags.app = this.contextApp.app;
    if (!this.assetDetail.tags.created_by) {
      this.assetDetail.tags.created_by = this.userData.email;
    }
    this.assetDetail.tags.hierarchy_json = { App: this.contextApp.app };
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      this.assetDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] =
        this.addAssetConfigureHierarchy[key];
    });
    this.assetDetail.tags.hierarchy = JSON.stringify(this.assetDetail.tags.hierarchy_json);
    const tags = {
      tags: this.assetDetail.tags,
    };
    console.log(tags);
    this.assetService.updateNonProvisionedAsset(this.contextApp.app, this.assetDetail.asset_id, tags).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Asset');
        this.isCreateAssetAPILoading = false;
        this.getAssetEmit.emit();
        this.onCloseCreateAssetModal();
      },
      (error) => {
        this.isCreateAssetAPILoading = false;
        this.toasterService.showError(error.message, 'Non-provisioned Assets');
        this.onCloseCreateAssetModal();
      }
    );
  }

  onCreateAsset() {
    if (
      !this.assetDetail.asset_id ||
      !this.assetDetail.tags.display_name ||
      !this.assetDetail.tags.asset_manager ||
      !this.assetDetail.tags.asset_model
      // ||
      // !this.assetDetail.tags.protocol ||
      // !this.assetDetail.tags.cloud_connectivity
    ) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Create ' + this.componentState);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_ASSET && !this.assetDetail.gateway_id) {
      this.toasterService.showError('Gateway Selection is compulsory.', 'Create ' + this.componentState);
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.assetDetail.tags.asset_manager)) {
      this.toasterService.showError('Email address is not valid', 'Create ' + this.componentState);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_ASSET && this.assetDetail.asset_id === this.assetDetail.gateway_id) {
      this.toasterService.showError('Gateway and Asset ID can not be the same.', 'Create ' + this.componentState);
      return;
    }
    if (
      this.contextApp.metadata?.partition?.telemetry?.partition_strategy !== 'Asset ID' &&
      !CONSTANTS.ONLY_NOS_AND_CHARS.test(this.assetDetail.tags.partition_key)
    ) {
      this.toasterService.showError(
        'Partition Key only contains numbers and characters.',
        'Create ' + (this.tileData ? this.tileData.table_key : '')
      );
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'Asset ID') {
      this.assetDetail.tags.partition_key = this.assetDetail.asset_id;
    }

    this.isCreateAssetAPILoading = true;
    this.assetDetail.tags.hierarchy_json = { App: this.contextApp.app };
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      this.assetDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] =
        this.addAssetConfigureHierarchy[key];
    });
    const modelObj = this.assetModels.filter((type) => type.name === this.assetDetail.tags.asset_model)[0];
    if (!this.assetDetail.metadata) {
      this.assetDetail.metadata = {};
    }
    this.assetDetail.metadata.telemetry_mode_settings = {
      g1_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g1_turbo_mode_frequency_in_ms || 60,
      g2_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g2_turbo_mode_frequency_in_ms || 120,
      g3_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g3_turbo_mode_frequency_in_ms || 180,
      g1_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g1_ingestion_frequency_in_ms || 600,
      g2_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g2_ingestion_frequency_in_ms || 1200,
      g3_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g3_ingestion_frequency_in_ms || 1800,
      turbo_mode_timeout_time: modelObj?.telemetry_mode_settings?.turbo_mode_timeout_time || 120,
    };
    this.assetDetail.metadata.data_ingestion_settings = {
      type: modelObj?.data_ingestion_settings?.type || 'all_props_at_fixed_interval',
    };
    this.assetDetail.metadata.measurement_settings = {
      g1_measurement_frequency_in_ms: modelObj?.measurement_settings?.g1_measurement_frequency_in_ms || 60,
      g2_measurement_frequency_in_ms: modelObj?.measurement_settings?.g2_measurement_frequency_in_ms || 120,
      g3_measurement_frequency_in_ms: modelObj?.measurement_settings?.g3_measurement_frequency_in_ms || 180,
    };
    // if (this.componentState === CONSTANTS.NON_IP_ASSET) {
    // this.assetDetail.metadata.setup_details = this.setupForm.value;
    // }
    const protocol = this.protocolList.find((protocolObj) => protocolObj.name === this.assetDetail.tags.protocol);
    this.assetDetail.metadata.package_app = protocol.metadata?.app;
    this.assetDetail.tags.hierarchy = JSON.stringify(this.assetDetail.tags.hierarchy_json);
    this.assetDetail.tags.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.assetDetail.app = this.contextApp.app;
    delete this.assetDetail.tags.reserved_tags;
    this.assetDetail.tags.category = this.componentState === CONSTANTS.NON_IP_ASSET ? null : this.componentState;
    // this.assetDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    const userObj = this.appUsers.find((type) => type.user_email === this.assetDetail.tags.asset_manager);
    this.assetDetail.tags.recipients = [];
    this.assetDetail.tags.recipients.push({
      email: this.assetDetail.tags.asset_manager,
      name: userObj.user_name,
      sms_no: this.assetDetail.tags.asset_manager.metadata?.sms_no,
      whatsapp_no: this.assetDetail.tags.asset_manager.metadata?.whatsapp_no,
    });
    this.assetDetail.tags.recipients = JSON.stringify(this.assetDetail.tags.recipients);
    const obj = JSON.parse(JSON.stringify(this.assetDetail));
    console.log(this.assetDetail);
    const methodToCall =
      this.componentState === CONSTANTS.NON_IP_ASSET
        ? this.assetService.createNonIPAsset(obj, this.contextApp.app)
        : this.assetService.createAsset(obj, this.contextApp.app);
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          if (this.componentState === CONSTANTS.NON_IP_ASSET) {
            this.updateGatewayTags(this.assetDetail);
            this.toasterService.showSuccess(
              response.message,
              'Create ' + (this.tileData ? this.tileData.table_key : '')
            );
          } else {
            this.isCreateAssetAPILoading = false;
            this.toasterService.showSuccess(
              response.message,
              'Create ' + (this.tileData ? this.tileData.table_key : '')
            );
            this.getAssetEmit.emit();
            this.onCloseCreateAssetModal();
          }
        },
        (error) => {
          this.isCreateAssetAPILoading = false;
          this.toasterService.showError(error.message, 'Create ' + (this.tileData ? this.tileData.table_key : ''));
          // this.onCloseCreateAssetModal();
        }
      )
    );
  }

  updateGatewayTags(assetObj) {
    const obj = {
      asset_id: assetObj.asset_id,
      partition_key: assetObj.tags.partition_key,
      model_id: assetObj.tags.asset_model,
    };
    // obj.partition_key[assetObj.asset_id] = assetObj.tags.partition_key;
    this.subscriptions.push(
      this.assetService.attachLegacyAssetToGateway(this.contextApp.app, assetObj.gateway_id, obj).subscribe(
        (response: any) => {
          this.isCreateAssetAPILoading = false;
          // this.toasterService.showSuccess(response.message, 'Create ' + this.componentState);
          this.getAssetEmit.emit();
          this.onCloseCreateAssetModal();
        },
        (error) => {
          this.isCreateAssetAPILoading = false;
          this.toasterService.showError(error.message, 'Create ' + this.componentState);
          // this.onCloseCreateAssetModal();
        }
      )
    );
  }

  onCloseCreateAssetModal() {
    $('#createAssetModal').modal('hide');
    this.cancelModal.emit();
  }
}
