import { AssetService } from 'src/app/services/assets/asset.service';
import { CampaignService } from './../../services/campaigns/campaign.service';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { ToasterService } from 'src/app/services/toaster.service';
import { Subscription } from 'rxjs';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CommonService } from 'src/app/services/common.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Campaign } from './campaign.model';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';
declare var $: any;
@Component({
  selector: 'app-add-campaign',
  templateUrl: './add-campaign.component.html',
  styleUrls: ['./add-campaign.component.css'],
})
export class AddCampaignComponent implements OnInit {
  isCampaignAPILoading = false;
  contextApp: any;
  userData: any;
  visitedSteps = 1;
  options: any = {
    locale: { format: 'DD-MM-YYYY' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    singleDatePicker: true,
    autoApply: true,
    minDate: moment(),
  };
  daterange: any = {};
  assetModels: any[] = [];
  campaignAssets: any[] = [];
  campaignObjectiveList = [
    {
      name: 'Firmware Upgrade of Field loT Assets over the Air',
      objective: 'FOTA',
      communication_method: 'Twin',
      model_type: [CONSTANTS.IP_GATEWAY, CONSTANTS.IP_ASSET],
    },
    {
      name: 'Sync Updated Model Properties with Field loT Assets',
      objective: 'Sync Properties/Alerts',
      communication_method: 'Message',
      model_type: [CONSTANTS.IP_ASSET, CONSTANTS.NON_IP_ASSET],
    },
    {
      name: 'Updating Measurement Frequency / Telemetry Frequency of Field loT Assets',
      objective: 'Change Telemetry Frequency',
      communication_method: 'Message',
      model_type: [CONSTANTS.IP_ASSET, CONSTANTS.NON_IP_ASSET],
    },
    {
      name: 'Updating Telemetry Ingestion Settings of Field loT Assets',
      objective: 'Change Ingestion Frequency',
      communication_method: 'Message',
      model_type: [CONSTANTS.IP_ASSET, CONSTANTS.NON_IP_ASSET],
    },
    {
      name: 'Updating Turbo Mode settings of Field loT Assets',
      objective: 'Change Telemetry Mode',
      communication_method: 'Message',
      model_type: [CONSTANTS.IP_ASSET, CONSTANTS.NON_IP_ASSET],
    },
    {
      name: 'Deploying Edge Rules in Field loT Assets',
      objective: 'Sync Rules',
      communication_method: 'Message',
      model_type: [CONSTANTS.IP_ASSET, CONSTANTS.NON_IP_ASSET],
    },
  ];
  propertySyncList = ['Measured Properties', 'Edge Derived Properties', 'Alerts'];
  isCreateCampaignAPILoading = false;
  @Output() cancelEvent: EventEmitter<any> = new EventEmitter<any>();
  campaignObj: Campaign = new Campaign();
  subscriptions: Subscription[] = [];
  packages: any[] = [];
  alertConditions: any[] = [];
  properties: any = {};
  requestTypeData = {
    INSTALL_PACKAGE: 'Install Package',
    DELETE_PACKAGE: 'Uninstall Package',
    UPGRADE_PACKAGE: 'Upgrade Package',
    set_properties: 'Sync Properties/Alerts',
  };
  hierarchyList: any[] = [];
  hierarchyArr = {};
  configureHierarchy = {};
  isGetCampaignAssetAPILoading = false;
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private campaignService: CampaignService,
    private assetService: AssetService
  ) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.campaignObj.objective = this.campaignObjectiveList[0].objective;
    this.campaignObj.job_request = {};
    this.onObjectiveChange(this.campaignObjectiveList[0]);
    this.contextApp.hierarchy.levels.forEach((element, index) => {
      this.hierarchyArr[index] = [];
    });
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
          if (this.contextApp.user.hierarchy[level]) {
            this.onChangeOfHierarchy(index);
          }
        }
      });
    }
  }

  onObjectiveChange(objective) {
    this.campaignObj.objective_name = objective.name;
    this.campaignObj.communication_method = objective.communication_method;
    this.searchAssetsModels();
  }

  onChangeOfHierarchy(i) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
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

    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
  }

  searchAssetsModels() {
    this.assetModels = [];
    const type = this.campaignObjectiveList.find((campaign) => campaign.objective === this.campaignObj.objective);
    const obj = {
      app: this.contextApp.app,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelsList(obj).subscribe((response: any) => {
        if (response && response.data) {
          response.data.forEach((model) => {
            type.model_type.forEach((typeModel) => {
              if (model.model_type === typeModel) {
                this.assetModels.push(model);
              }
            });
          });
        }
      })
    );
  }

  selectedDate(value: any, type) {
    console.log(value);
    console.log(this.campaignObj);
    if (type === 'start') {
      this.campaignObj.expected_start_date = moment(value.start).utc().unix();
      this.campaignObj.expected_start_date_display = this.commonService.convertEpochToOnlyDate(
        this.campaignObj.expected_start_date
      );
    }
    if (type === 'end') {
      this.campaignObj.expected_end_date = moment(value.start).utc().unix();
      this.campaignObj.expected_end_date_display = this.commonService.convertEpochToOnlyDate(
        this.campaignObj.expected_end_date
      );
    }
    if (
      this.campaignObj.expected_start_date &&
      this.campaignObj.expected_end_date &&
      this.campaignObj.expected_end_date < this.campaignObj.expected_start_date
    ) {
      this.toasterService.showError('End date should be greater than Start date', 'Create Campaign');
      this.campaignObj.expected_end_date = null;
      this.campaignObj.expected_end_date_display = null;
      return;
    }
  }

  onAssetModelChange() {
    if (this.campaignObj.asset_model_obj) {
      this.campaignObj.asset_model = this.campaignObj.asset_model_obj.name;
      this.getPackages();
    } else {
      this.campaignObj.asset_model = undefined;
      this.campaignObj.job_request = {};
      this.campaignObj.request_type = undefined;
      this.packages = [];
    }
    this.campaignAssets = [];
  }

  openAssetsViewModal() {
    this.getAssetsForCampaign();
    $('#viewCampaignAssetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getAssetsForCampaign() {
    this.campaignAssets = [];
    this.isGetCampaignAssetAPILoading = true;
    const hierarchy = { App: this.contextApp.app };
    console.log(this.configureHierarchy);
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    const obj = {
      hierarchy: JSON.stringify(hierarchy),
      asset_model: this.campaignObj.asset_model_obj.name,
      type: this.campaignObj.asset_model_obj.model_type,
    };
    this.assetService.getLegacyAssets(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response?.data) {
          this.campaignAssets = response.data;
          this.isGetCampaignAssetAPILoading = false;
        }
      },
      (error) => (this.isGetCampaignAssetAPILoading = false)
    );
  }

  onPrepareHierarchy() {
    this.campaignObj.hierarchyString = '';
    this.campaignObj.hierarchy = { App: this.contextApp.app };
    this.campaignObj.hierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[key]) {
        this.campaignObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        this.campaignObj.hierarchyString =
          this.campaignObj.hierarchyString +
          (this.campaignObj.hierarchyString ? ' / ' : '') +
          this.configureHierarchy[key] +
          (this.configureHierarchy[Object.keys(this.configureHierarchy)[index + 1]] ? ' / ' : '');
      }
    });
    console.log(this.campaignObj.hierarchyString);
  }

  getPackages() {
    this.packages = [];
    this.subscriptions.push(
      this.assetModelService
        .getPackages(this.contextApp.app, this.campaignObj.asset_model_obj.name, {})
        .subscribe((response: any) => {
          if (response.data?.length > 0) {
            const arr = [];
            response.data.forEach((packageObj) => {
              let flag = false;
              arr.forEach((item) => {
                item.versions = item.versions ? item.versions : [];
                if (packageObj.name === item.name) {
                  flag = true;
                  item.versions.push(packageObj.version);
                }
              });
              if (!flag) {
                packageObj.versions = [packageObj.version];
                arr.push(packageObj);
              }
            });
            this.packages = JSON.parse(JSON.stringify(arr));
          }
        })
    );
  }

  onCommandChange() {
    this.campaignObj.job_request.package_obj = undefined;
    this.campaignObj.job_request.version = undefined;
    // this.campaignObj.request_type = undefined;
  }

  getAssetsModelProperties() {
    return new Promise<void>((resolve1, reject) => {
      const obj = {
        app: this.contextApp.app,
        name: this.campaignObj.asset_model,
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
        asset_model: this.campaignObj.asset_model,
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

  prepareFOTAPayload() {
    const obj = {
      desired_properties: {
        package_management: {
          command: this.campaignObj.request_type,
          package_details: {
            app_name: this.campaignObj.job_request.package_obj.name,
            version: this.campaignObj.job_request.version,
            url: environment.blobURL + this.campaignObj.job_request.package_obj.url,
            token: environment.blobKey,
          },
        },
      },
    };
    return obj;
  }

  async prepareSyncPropertiesPayload() {
    await this.getAssetsModelProperties();
    await this.getAlertConditions();
    const obj = {
      command: 'set_properties',
    };
    if (this.campaignObj.job_request.type.indexOf('Measured Properties') > -1) {
      obj['measured_properties'] = {};
      this.properties.measured_properties.forEach((prop) => {
        obj['measured_properties'][prop.json_key] = prop?.metadata || {};
        obj['measured_properties'][prop.json_key].g = prop.group;
      });
      console.log(obj);
    }
    if (this.campaignObj.job_request.type.indexOf('Edge Derived Properties') > -1) {
      obj['edge_derived_properties'] = {};
      this.properties.edge_derived_properties.forEach((prop) => {
        obj['edge_derived_properties'][prop.json_key] = prop?.metadata || {};
        obj['edge_derived_properties'][prop.json_key].g = prop.group;
      });
      console.log(obj);
    }
    if (this.campaignObj.job_request.type.indexOf('Alerts') > -1) {
      obj['alerts'] = {};
      this.alertConditions.forEach((prop) => {
        obj['alerts'][prop.code] = prop.metadata;
      });
      console.log(obj);
    }
    return obj;
  }

  async createCampaign() {
    const obj = JSON.parse(JSON.stringify(this.campaignObj));
    obj.hierarchy = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (obj.objective === 'FOTA') {
      if (
        !obj.asset_model ||
        !obj.job_request ||
        !obj.job_request.package_obj ||
        !obj.job_request.version ||
        !obj.request_type
      ) {
        this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Create Campaign');
        return;
      }
    } else if (obj.objective === 'Sync Properties/Alerts') {
      if (!obj.asset_model || !obj.job_request || !obj.job_request.type) {
        this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Create Campaign');
        return;
      }
    }
    obj.epoch = true;
    this.isCreateCampaignAPILoading = true;
    delete obj.expected_end_date_display;
    delete obj.expected_start_date_display;
    delete obj.asset_model_obj;
    delete obj.objective_name;
    delete obj.hierarchyString;
    obj.job_id = this.commonService.generateUUID();
    if (obj.objective === 'FOTA') {
      obj.job_request = this.prepareFOTAPayload();
      obj.request_type = this.requestTypeData[this.campaignObj.request_type];
    } else if (obj.objective === 'Sync Properties/Alerts') {
      obj.job_request = await this.prepareSyncPropertiesPayload();
      obj.request_type = this.requestTypeData[obj.job_request.command];
    }
    this.subscriptions.push(
      this.campaignService.createCampaign(this.contextApp.app, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(APIMESSAGES.CREATE_CAMPAIGN_SUCCESS, 'Create Campaign');
          this.isCreateCampaignAPILoading = false;
          this.onCloseCampaignModal();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Create Campaign');
          this.isCreateCampaignAPILoading = false;
        }
      )
    );
  }

  closeCampaignAssetModal() {
    $('#viewCampaignAssetModal').modal('hide');
  }

  onCloseCampaignModal() {
    console.log(this.campaignObj);
    this.cancelEvent.emit();
  }
}
