import { object } from '@amcharts/amcharts4/core';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
import { Asset } from 'src/app/models/asset.model';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ApplicationService } from './../../services/application/application.service';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { CommonService } from './../../services/common.service';
import { ToasterService } from './../../services/toaster.service';
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
  decodedToken: any;
  contextApp: any;
  addAssetConfigureHierarchy = {};
  addAssetHierarchyArr: any[] = [];
  constantData = CONSTANTS;
  appUsers: any[] = [];
  filteredUsers: any[] = [];
  @Input() gateways: any[] = [];
  actualGateways: any[] = [];
  originalGateways: any[] = [];
  assetModels: any[] = [];
  userData: any;
  subscriptions: any[] = [];
  // setupForm: FormGroup;
  protocolList = CONSTANTS.PROTOCOLS;
  isAssetEditable = false;
  isWhiteLablePriviledge = false;
  whiteListedAssets: any[] = [];
  whiteListedAssetsfilter: any[] = [];
  selectedWhitelistAsset: any;
  actualhierarchyArr = [];
  isHierarchyEditable = false;
  selectedHierarchy: any = {};
  showAssetAndGatewayId: boolean = false;
  legacyassetId: any;

  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    if (this.decodedToken?.privileges?.indexOf('WASMP') > -1) {
      this.getWhiteListedAsset();
    }

    this.actualhierarchyArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
    this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
    this.actualGateways = this.gateways;
    await this.getApplicationUsers();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.addAssetHierarchyArr[1] = this.actualhierarchyArr.filter(r => r.level == 1);
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

  getWhiteListedAsset() {
    const obj = {
      type: this.componentState,
      provisioned: 'false'
    };
    return new Promise<void>((resolve1, reject) => {
      this.whiteListedAssets = [];
      this.whiteListedAssetsfilter = [];
      this.subscriptions.push(
        this.assetService.getWhiteListedAsset(obj, this.contextApp.app).subscribe(
          (response: any) => {
            if (response && response.data) {
              this.whiteListedAssets = response.data;
              this.whiteListedAssetsfilter = response.data;
            }
            resolve1();
          },
          (error) => {

          }),
      );
    });
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
    let parentId = 0;
    Object.keys(this.addAssetConfigureHierarchy).forEach((key, index) => {
      if (this.addAssetConfigureHierarchy[key]) {
        let parentData = this.actualhierarchyArr.find(r => r.level == index + 1 && r.key == this.addAssetConfigureHierarchy[key] && r.parent_id == parentId)
        if (parentData) {
          parentId = parentData.id;
        }
      }
    });
    this.selectedHierarchy = this.actualhierarchyArr.find(r => r.id == parentId);
    if (this.selectedHierarchy) {
      this.addAssetHierarchyArr[i + 1] = this.actualhierarchyArr.filter(r => r.level == i + 1 && r.parent_id == this.selectedHierarchy.id);
    }

    const hierarchyObj: any = { App: this.contextApp.app };

    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      if (this.addAssetConfigureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.addAssetConfigureHierarchy[key];
      }
    });
    Object.keys(hierarchyObj).forEach((key) => {
      this.whiteListedAssetsfilter = this.whiteListedAssets?.filter(f => f?.hierarchy_json == null || f?.hierarchy_json[key] == hierarchyObj[key])
    })
    //let maxObject = hierarchyObj.fin
    if (Object.keys(hierarchyObj).length === 1) {
      this.gateways = JSON.parse(JSON.stringify(this.actualGateways));
      this.filteredUsers = this.appUsers;

    } else {
      const arr = [];
      this.gateways = [];
      this.updateAssetManagerWithHierarchy(hierarchyObj);
      this.originalGateways.forEach((asset) => {
        let trueFlag = 0;
        let flaseFlag = 0;

        Object.keys(hierarchyObj).forEach((hierarchyKey) => {
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
        this.addAssetHierarchyArr[1] = this.actualhierarchyArr.filter(r => r.level == 1);
      }
    }
    // await this.getAssets(hierarchyObj);
  }
  updateAssetManagerWithHierarchy(hierarchyObj) {
    let lastObjKey = Object.keys(hierarchyObj).reverse()[0].trim();
    // let selectedObjValue = hierarchyObj[Object.keys(hierarchyObj).reverse()[0].trim()];
    //
    this.filteredUsers = this.appUsers.filter((user) => {
      if (user.role == 'App Admin') {
        return true;
      } else {
        let firstObjectKeyApp = Object.keys(hierarchyObj)[0].trim();
        let secondObjectMgt = Object.keys(hierarchyObj)[1]?.trim();
        let thirdObjectClient = Object.keys(hierarchyObj)[2]?.trim();
        let fourthObjectLocation = Object.keys(hierarchyObj)[3]?.trim();
        if (
          fourthObjectLocation &&
          user.hierarchy[fourthObjectLocation] == hierarchyObj[fourthObjectLocation] &&
          user.hierarchy[thirdObjectClient] == hierarchyObj[thirdObjectClient] &&
          user.hierarchy[secondObjectMgt] == hierarchyObj[secondObjectMgt] &&
          user.hierarchy[firstObjectKeyApp] == hierarchyObj[firstObjectKeyApp]
        ) {
          return true;
        } else if (
          !fourthObjectLocation &&
          thirdObjectClient &&
          user.hierarchy[thirdObjectClient] == hierarchyObj[thirdObjectClient] &&
          user.hierarchy[secondObjectMgt] == hierarchyObj[secondObjectMgt] &&
          user.hierarchy[firstObjectKeyApp] == hierarchyObj[firstObjectKeyApp]
        ) {
          return true;
        } else if (
          !fourthObjectLocation &&
          !thirdObjectClient &&
          secondObjectMgt &&
          user.hierarchy[secondObjectMgt] == hierarchyObj[secondObjectMgt] &&
          user.hierarchy[firstObjectKeyApp] == hierarchyObj[firstObjectKeyApp]
        ) {
          return true;
        } else if (
          !fourthObjectLocation &&
          !thirdObjectClient &&
          !secondObjectMgt &&
          firstObjectKeyApp &&
          user.hierarchy[firstObjectKeyApp] == hierarchyObj[firstObjectKeyApp]
        ) {
          return true;
        }
      }
      //if (user.hierarchy[lastObjKey] == hierarchyObj[lastObjKey] && Object.keys(user.hierarchy).length <= Object.keys(hierarchyObj).length)
      //return true;
    });
    //
  }
  onChangeAssetsModel() {
    if (this.assetDetail.tags.asset_model) {
      const modelObj = this.assetModels.filter((type) => type.name === this.assetDetail.tags.asset_model)[0];
      modelObj.tags = {
        cloud_connectivity: modelObj.cloud_connectivity,
        protocol: modelObj.protocol,
      };
      const modelTags = {
        "Cloud_Connectivity": modelObj.cloud_connectivity,
        "Protocol": modelObj.protocol
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
            this.filteredUsers = this.appUsers;
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
    this.assetDetail.tags.hierarchy_id = this.selectedHierarchy?.id;
    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      this.assetDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] =
        this.addAssetConfigureHierarchy[key];
    });
    this.assetDetail.tags.hierarchy = JSON.stringify(this.assetDetail.tags.hierarchy_json);
    const tags = {
      tags: this.assetDetail.tags,
    };
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
  async onWhitelistedAssetChange() {
    let newPromise = await this.getAssetsModels(this.componentState);
    Promise.resolve(newPromise).then(res => {

      if (this.selectedWhitelistAsset === undefined) {
        this.assetDetail.asset_id = null;
        this.assetDetail.tags.display_name = null;
        this.assetDetail.tags.cloud_connectivity = undefined;
        this.assetDetail.tags.protocol = undefined;
        this.isHierarchyEditable = false;
        this.onChangeOfAddAssetHierarchy(0)
      }
      else {
        this.assetDetail.asset_id = this.selectedWhitelistAsset.asset_id;
        this.assetDetail.tags.display_name = this.selectedWhitelistAsset.display_name;
        this.assetDetail.tags.protocol = this.selectedWhitelistAsset.protocol;
        this.assetDetail.tags.cloud_connectivity = this.selectedWhitelistAsset.cloud_connectivity;
        this.assetDetail.tags.cloud_connectivity = this.selectedWhitelistAsset.cloud_connectivity;
        if (this.selectedWhitelistAsset.hasOwnProperty('protocol') && this.selectedWhitelistAsset.protocol != null && this.selectedWhitelistAsset.protocol != '')
          this.assetModels = this.assetModels.filter((type) => type.protocol === this.selectedWhitelistAsset.protocol);
        if (this.selectedWhitelistAsset.hasOwnProperty('hierarchy_json')) {
          //this.assetDetail.tags.hierarchy_json = this.selectedWhitelistAsset.hierarchy_json;
          this.contextApp.hierarchy.levels.forEach((level, index) => {
            if (index !== 0) {
              if (this.selectedWhitelistAsset?.hierarchy_json) {
                this.addAssetConfigureHierarchy[index] = this.selectedWhitelistAsset?.hierarchy_json[level];
                if (this.selectedWhitelistAsset?.hierarchy_json[level]) {
                  this.isHierarchyEditable = true;
                  this.onChangeOfAddAssetHierarchy(index);

                }
              }
            }

          });

        }
      }
    })
  }
  onCreateAsset() {
    if (!this.assetDetail.asset_id) {
      this.assetDetail.asset_id = 'AssetID';
    }
    if (
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
      this.contextApp.metadata?.partition?.telemetry?.partition_strategy !== 'asset_id' &&
      !CONSTANTS.ONLY_NOS_AND_CHARS.test(this.assetDetail.tags.partition_key)
    ) {
      this.toasterService.showError(
        'Partition Key only contains numbers and characters.',
        'Create ' + (this.tileData ? this.tileData.table_key : '')
      );
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'Asset ID' || this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'asset_id') {
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
      g1_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g1_turbo_mode_frequency_in_ms || 10000,
      g2_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g2_turbo_mode_frequency_in_ms || 10000,
      g3_turbo_mode_frequency_in_ms: modelObj?.telemetry_mode_settings?.g3_turbo_mode_frequency_in_ms || 10000,
      g1_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g1_ingestion_frequency_in_ms || 60000,
      g2_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g2_ingestion_frequency_in_ms || 60000,
      g3_ingestion_frequency_in_ms: modelObj?.telemetry_mode_settings?.g3_ingestion_frequency_in_ms || 60000,
      turbo_mode_timeout_time: modelObj?.telemetry_mode_settings?.turbo_mode_timeout_time || 120000,
    };
    this.assetDetail.metadata.data_ingestion_settings = {
      type: modelObj?.data_ingestion_settings?.type || 'all_props_at_fixed_interval',
    };
    this.assetDetail.metadata.measurement_settings = {
      g1_measurement_frequency_in_ms: modelObj?.measurement_settings?.g1_measurement_frequency_in_ms || 10000,
      g2_measurement_frequency_in_ms: modelObj?.measurement_settings?.g2_measurement_frequency_in_ms || 10000,
      g3_measurement_frequency_in_ms: modelObj?.measurement_settings?.g3_measurement_frequency_in_ms || 10000,
    };
    // if (this.componentState === CONSTANTS.NON_IP_ASSET) {
    // this.assetDetail.metadata.setup_details = this.setupForm.value;
    // }
    const protocol = this.protocolList.find((protocolObj) => protocolObj.name === this.assetDetail.tags.protocol);
    this.assetDetail.metadata.package_app = protocol.metadata?.app;
    this.assetDetail.tags.hierarchy = JSON.stringify(this.assetDetail.tags.hierarchy_json);
    this.assetDetail.tags.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.assetDetail.tags.hierarchy_id = this.selectedHierarchy?.id;
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
    let parentId = 0;
    let hierarchy_ids = {};
    Object.keys(this.contextApp?.hierarchy?.levels).forEach((key, index) => {
      if (index != 0) {
        key = this.contextApp?.hierarchy?.levels[key]
        if (this.assetDetail.tags.hierarchy_json[key]) {
          let obj = this.actualhierarchyArr.find(r => r.level == index && r.key == this.assetDetail.tags.hierarchy_json[key] && r.parent_id == parentId);
          if (obj) {
            parentId = obj.id;
            hierarchy_ids[index] = obj.id;
          }
        }
      }
    });
    if (Object.keys(hierarchy_ids).length > 0) {
      this.assetDetail.tags.hierarchy_ids = hierarchy_ids;
    }
    const obj = JSON.parse(JSON.stringify(this.assetDetail));
    const methodToCall = this.SetMethodCallOnCondition(obj);
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.legacyassetId = response.assetId;

          localStorage.removeItem(CONSTANTS.ALL_ASSETS_LIST);
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

  private SetMethodCallOnCondition(obj: any) {
    return this.componentState === CONSTANTS.NON_IP_ASSET
      ? this.selectedWhitelistAsset === undefined ? this.assetService.createNonIPAsset(obj, this.contextApp.app) : this.assetService.createWhitelistedLegacyAsset(obj, this.assetDetail.asset_id, this.contextApp)
      : this.selectedWhitelistAsset === undefined ? this.assetService.createAsset(obj, this.contextApp.app) : this.assetService.createWhitelistedAsset(obj, this.assetDetail.asset_id, this.contextApp);
  }


  legacyAsset(obj: any) {
    this.subscriptions.push(
      this.assetService.createNonIPAsset(obj, this.contextApp.app).subscribe(
        (response: any) => {
          let responsedata = response;

          this.isCreateAssetAPILoading = false;
          // this.toasterService.showSuccess(response.message, 'Create ' + this.componentState);
        },
        (error) => {
          this.toasterService.showError(error.message, 'Create ' + this.componentState);
          // this.onCloseCreateAssetModal();
        }
      )
    );
  }

  updateGatewayTags(assetObj) {
    const obj = {
      asset_id: this.legacyassetId ? this.legacyassetId : assetObj.asset_id,
      partition_key: this.legacyassetId ? this.legacyassetId : assetObj.tags.partition_key,
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
