import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

declare var $: any;
@Component({
  selector: 'app-fota',
  templateUrl: './fota.component.html',
  styleUrls: ['./fota.component.css'],
})
export class FotaComponent implements OnInit {
  @Input() assetTwin: any;
  @Input() asset: any;
  @Output() refreshAssetTwin: EventEmitter<any> = new EventEmitter<any>();
  subscriptions: any[] = [];
  contextApp: any;
  selectedAsset: any;
  assetPackages: any[] = [];
  currentAssetApps: any[] = [];
  assetApps: any[] = [];
  installPackages: any[] = [];
  updatePackages: any[] = [];
  uninstallPackages: any[] = [];
  applicationList: any[] = CONSTANTS.ASSETAPPPS;
  isAssetsAPILoading = false;
  assets: any[] = [];
  selectedAssetPackage: any;
  isAPILoading = false;
  modalConfig: any;
  twinResponseInterval: any;
  btnClickType: any;
  confirmBodyMessage: any;
  confirmHeaderMessage: string;
  isGetAPILoading = false;
  c2dJobFilter: any = {};
  constructor(
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) {}

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.isGetAPILoading = true;
    this.getAssetsOfGateway();
    this.c2dJobFilter.request_type = 'Install Package,Uninstall Package,Upgrade Package';
    this.c2dJobFilter.job_type = 'Twin';
    await this.getAssetModelData();
    await this.getAssetTwinData();
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
          }
          this.isAssetsAPILoading = false;
        },
        (error) => (this.isAssetsAPILoading = false)
      )
    );
  }

  getAssetModelData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetModelService.getPackages(this.contextApp.app, this.asset.tags.asset_model, {}).subscribe(
          (response: any) => {
            if (response.data?.length > 0) {
              this.assetPackages = response.data;
              console.log('packagesssss   ', this.assetPackages);
              this.assetPackages.forEach((packageObj) => {
                if (this.assetApps.indexOf(packageObj.name) === -1) {
                  this.assetApps.push(packageObj.name);
                }
                this.applicationList.forEach((app) => {
                  if (packageObj.name === app.name) {
                    packageObj['is_install'] = app.is_install;
                    packageObj['is_uninstall'] = app.is_uninstall;
                    packageObj['is_update'] = app.is_update;
                  }
                });
              });
            }
            resolve();
          },
          (error) => {
            resolve();
          }
        )
      );
    });
  }

  getAssetTwinData() {
    return new Promise<void>((resolve) => {
      const asset = this.asset;
      this.subscriptions.push(
        this.assetService.getAssetTwin(this.contextApp.app, asset.asset_id).subscribe(
          (response) => {
            this.assetTwin = response;
            if (!this.assetTwin.twin_properties) {
              this.assetTwin.twin_properties = {};
            }
            if (!this.assetTwin.twin_properties.reported) {
              this.assetTwin.twin_properties.reported = {};
            }
            if (!this.assetTwin.twin_properties.reported.installed_packages) {
              this.assetTwin.twin_properties.reported.installed_packages = {};
            }
            if (this.assetTwin.twin_properties?.reported?.installed_packages) {
              this.currentAssetApps = Object.keys(this.assetTwin.twin_properties.reported.installed_packages);
            }
            if (this.currentAssetApps.length > 0) {
              this.assetPackages.forEach((assetPackage) => {
                const index = this.currentAssetApps.findIndex((packageName) => packageName === assetPackage.name);
                if (index === -1) {
                  this.installPackages.push(assetPackage);
                }
                this.currentAssetApps.forEach((currentPackage) => {
                  if (
                    assetPackage.name === currentPackage &&
                    this.assetTwin.twin_properties.reported.installed_packages[currentPackage] === assetPackage.version
                  ) {
                    this.uninstallPackages.push(assetPackage);
                  }
                  if (
                    assetPackage.name === currentPackage &&
                    this.assetTwin.twin_properties.reported.installed_packages[currentPackage] !== assetPackage.version
                  ) {
                    this.updatePackages.push(assetPackage);
                  }
                });
              });
            } else {
              this.installPackages = JSON.parse(JSON.stringify(this.assetPackages));
            }
            this.isGetAPILoading = false;
            resolve();
          },
          (error) => (this.isGetAPILoading = false)
        )
      );
    });
  }

  updateAssetTwin(type) {
    this.isAPILoading = true;
    const obj = {
      desired_properties: {
        package_management: {
          job_id: this.asset.asset_id + '_' + this.commonService.generateUUID(),
          command: null,
          package_details: {
            app_name: this.selectedAssetPackage.name,
            version: this.selectedAssetPackage.version,
            url: environment.blobURL + this.selectedAssetPackage.url,
            token: environment.blobKey,
            job_id: null,
          },
        },
      },
      job_id: null,
      timestamp: moment().utc().unix(),
      sub_job_id: null,
      asset_id: this.asset.asset_id,
      request_type: 'FOTA',
    };
    obj.job_id = obj.desired_properties.package_management.job_id;
    obj.sub_job_id = obj.job_id + '_1';
    obj.desired_properties.package_management.package_details.job_id = obj.desired_properties.package_management.job_id;
    if (type === 'Install') {
      obj.desired_properties.package_management.command = 'INSTALL_PACKAGE';
      obj.request_type = 'Install Package';
    } else if (type === 'Upgrade' || type === 'Downgrade') {
      obj.desired_properties.package_management.command = 'UPGRADE_PACKAGE';
      obj.request_type = 'Upgrade Package';
    } else if (type === 'Uninstall') {
      obj.desired_properties.package_management.command = 'DELETE_PACKAGE';
      obj.request_type = 'Uninstall Package';
    }

    this.subscriptions.push(
      this.assetService.updateAssetTwin(this.contextApp.app, this.asset.asset_id, obj).subscribe(
        (response: any) => {
          this.modalConfig.isDisplaySave = false;
          this.onModalEvents('close');
          this.isAPILoading = false;
          this.toasterService.showSuccess('Request sent to Asset', type);
          this.assetService.refreshRecentJobs.emit();
        },
        (error) => {
          clearInterval(this.twinResponseInterval);
          this.confirmBodyMessage = error.message;
          this.modalConfig.isDisplaySave = false;
          this.assetService.refreshRecentJobs.emit();
          this.isAPILoading = false;
        }
      )
    );
  }

  onCheckboxChange(event, packageObj) {
    if (event.target.checked) {
      this.selectedAssetPackage = packageObj;
    } else {
      this.selectedAssetPackage = undefined;
    }
  }

  openConfirmDialog(type) {
    this.btnClickType = type;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true,
    };
    this.confirmHeaderMessage = type + ' Package';
    this.confirmBodyMessage = 'Are you sure you want to ' + type.toLowerCase() + ' this package?';
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save') {
      this.updateAssetTwin(this.btnClickType);
      this.btnClickType = undefined;
    } else {
      $('#confirmMessageModal').modal('hide');
      $('#packageManagementModal').modal('hide');
      clearInterval(this.twinResponseInterval);
      this.refreshAssetTwin.emit();
      this.installPackages = [];
      this.updatePackages = [];
      this.uninstallPackages = [];
      this.selectedAsset = undefined;
      // this.assetPackages = [];
      this.currentAssetApps = [];
      // this.assetTwin = undefined;
      this.isAPILoading = false;
      this.selectedAssetPackage = undefined;
      this.isGetAPILoading = true;
      this.getAssetTwinData();
    }
  }
}
