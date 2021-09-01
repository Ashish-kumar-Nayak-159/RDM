import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../../services/common.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
declare var $: any;
@Component({
  selector: 'app-asset-management-assets',
  templateUrl: './asset-management-assets.component.html',
  styleUrls: ['./asset-management-assets.component.css']
})
export class AssetManagementAssetsComponent implements OnInit, OnDestroy {

  @Input() type: any;
  assetsList: any[] = [];
  isAssetListLoading = false;
  insideScrollFunFlag = false;
  currentOffset = 0;
  currentLimit = 20;
  contextApp: any;
  tileData = {};
  subscriptions: Subscription[] = [];
  isOpenAssetCreateModal = false;
  gateways: any[] = [];
  confirmBodyMessage: string;
  confirmHeaderMessage: string;
  selectedAssets: any[] = [];
  modalConfig: { isDisplaySave: boolean; isDisplayCancel: boolean; saveBtnText: string; cancelBtnText: string; stringDisplay: boolean; };
  btnClickType: any;
  isAPILoading = false;
  isAllAssetSelected = false;
  constantData = CONSTANTS;
  assetTwin: any;
  assetPackages: any[] = [];
  currentAssetApps: any[] = [];
  assetApps: any[] = [];
  selectedAssetApp: any;
  selectedAssetPackage: any;
  twinResponseInterval: any;
  installPackages: any[] = [];
  updatePackages: any[] = [];
  uninstallPackages: any[] = [];
  displyaMsgArr = [];
  applicationList: any[] = CONSTANTS.ASSETAPPPS;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  tabData: any;
  decodedToken: any;
  selectedAsset: any;
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.getTileName();
    this.assetsList = [];
    this.getAssets();
    // if (this.type === 'legacy-assets') {
    //   this.componentState = CONSTANTS.NON_IP_ASSET;
    // } else if (this.type === 'iot-assets') {
    //   this.componentState = CONSTANTS.IP_ASSET;
    // } else if (this.type === 'iot-gateways') {
    //   this.componentState = CONSTANTS.IP_GATEWAY;
    // }
    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0))
        >= parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
          this.currentOffset += this.currentLimit;
          this.getAssets();
          this.insideScrollFunFlag = true;
        }
      });
    }, 2000);
  }

  getGatewayList() {
    this.gateways = [];
    const obj = {
      app: this.contextApp.app,
      type: CONSTANTS.IP_GATEWAY,
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
    };
    this.subscriptions.push(this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.assetsList.forEach(item => {
            const name = this.gateways.filter(gateway => gateway.asset_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      }
    ));
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach(item => {
      console.log(item.page);
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    selectedItem.forEach(item => {
      this.tileData[item.name] = item.value;
    });
    if (this.type === CONSTANTS.IP_ASSET) {
    this.tabData = {
      tab_name: this.tileData['IOT Assets Tab Name'],
      table_key: this.tileData['IOT Assets Table Key Name']
    };
    }
    if (this.type === CONSTANTS.NON_IP_ASSET) {
    this.tabData = {
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name']
    };
    }
    if (this.type === CONSTANTS.IP_GATEWAY) {
    this.tabData = {
      tab_name: this.tileData['IOT Gateways Tab Name'],
      table_key: this.tileData['IOT Gateways Table Key Name']
    };
    }
    this.currentLimit = this.tileData && this.tileData[2] ? Number(this.tileData[2]?.value) : 20;
  }

  getAssets() {
    this.isAssetListLoading = true;
    const obj: any = {};
    obj.app = this.contextApp.app;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    obj.provision_status = 'Pending,Completed';
    if (this.contextApp) {
      obj.hierarchy = JSON.stringify(this.contextApp.user.hierarchy);
    }
    let methodToCall;
    if (this.type === CONSTANTS.NON_IP_ASSET) {
      obj.type = CONSTANTS.NON_IP_ASSET;
      methodToCall = this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app);
    } else {
      obj.type = this.type;
      methodToCall = this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response.data) {
          response.data.forEach(item => {
            if (!item.display_name) {
              item.display_name = item.asset_id;
            }
            if (item.hierarchy) {
              item.hierarchyString = '';
              const keys = Object.keys(item.hierarchy);
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                item.hierarchyString += item.hierarchy[key] ? (item.hierarchy[key] + ( keys[index + 1] ? ' / ' : '')) : '';
              });
            }
            if (this.type === CONSTANTS.NON_IP_ASSET) {
              const name = this.gateways.filter(gateway => gateway.asset_id === item.gateway_id)[0]?.display_name;
              item.gateway_display_name = name ? name : item.gateway_id;
            }
          });
          this.assetsList = [...this.assetsList, ...response.data];
        }
        if (response.data.length === this.currentLimit) {
        this.insideScrollFunFlag = false;
        } else {
          this.insideScrollFunFlag = true;
        }

        this.isAssetListLoading = false;
      }, error => {
        this.isAssetListLoading = false;
        this.insideScrollFunFlag = false;
    }));
  }

  openAssetCreateModal(asset = undefined) {
    if (this.type === CONSTANTS.NON_IP_ASSET) {
      this.getGatewayList();
    }
    this.selectedAsset = asset;
    this.isOpenAssetCreateModal = true;
  }

  onClickOfAssetAllCheckbox() {
    if (this.isAllAssetSelected) {
      this.selectedAssets = JSON.parse(JSON.stringify(this.assetsList));
    } else {
      this.selectedAssets = [];
    }
  }

  onCreateAssetCancelModal() {
    this.isOpenAssetCreateModal = false;
  }

  onAssetSelection(asset) {
    if (this.selectedAssets.length === 0) {
      this.selectedAssets.push(asset);
    } else {
      const index = this.selectedAssets.findIndex(assetObj => assetObj.asset_id === asset.asset_id);
      if (index > -1) {
        this.selectedAssets.splice(index, 1);
      } else {
        this.selectedAssets.push(asset);
      }
    }
    if (this.selectedAssets.length === this.assetsList.length) {
      this.isAllAssetSelected = true;
    } else {
      this.isAllAssetSelected = false;
    }
  }

  checkForAssetVisibility(asset) {
    const index = this.selectedAssets.findIndex(assetObj => assetObj.asset_id === asset.asset_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  onSingleOperationClick(type, asset) {
    // if (this.selectedAssets?.length === 0) {
    //   this.toasterService.showError('Please select an asset to perform the operation', 'Asset Management');
    //   return;
    // }
    // if (this.selectedAssets?.length > 1) {
    //   this.toasterService.showError('Please select only one asset to perform the operation', 'Asset Management');
    //   return;
    // }
    this.selectedAssets = [];
    this.selectedAssets.push(asset);
    if (type.toLowerCase().includes('package') && this.type === CONSTANTS.NON_IP_ASSET) {
      this.toasterService.showError(`Package Management is not available for Legacy asset.`, 'Asset Management');
      return;
    } else if (!type.toLowerCase().includes('provision') && this.type === CONSTANTS.NON_IP_ASSET) {
      this.toasterService.showError(`You can't perform this operation on legacy asset.`, 'Asset Management');
      return;
    }

    if (type === 'Deprovision' || type === 'Enable' || type === 'Disable') {
      this.openConfirmDialog(type);
    } else if (type === 'Package Management') {
      this.openPackageManagementModal();
    }
  }

  onBulkOperationClick(type) {
    // if (!type.toLowerCase().includes('provision') && this.componentState === CONSTANTS.NON_IP_ASSET) {
    //   this.toasterService.showError(`You can't perform this operation on legacy asset.`, 'Asset Management');
    //   return;
    // }
    this.toasterService.showError('Currently Bulk Operations are not available for use. Work in Progress.', 'Asset Management');
  }

  openConfirmDialog(type) {
    this.btnClickType = type;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true
    };
    if (type === 'Enable') {
      this.confirmBodyMessage = 'Are you sure you want to enable this asset?';
      this.confirmHeaderMessage = 'Enable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Disable') {
      this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be temporarily disabled. Are you sure you want to continue?';
      this.confirmHeaderMessage = 'Disable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Deprovision') {
      this.confirmHeaderMessage = 'Deprovision ' + (this.tabData?.table_key || 'Asset');
      if (this.type !== CONSTANTS.NON_IP_ASSET) {
      this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be permanently deleted. Instead, you can temporarily disable the ' + (this.tabData?.table_key || 'Asset') + '.' +
      ' Are you sure you want to continue?';
      } else {
        this.confirmBodyMessage = 'This ' + (this.tabData?.table_key || 'Asset') + ' will be permanently deleted.' +
      ' Are you sure you want to continue?';
      }
    } else if (type === 'Install' || type === 'Uninstall' ||
    type === 'Upgrade' || type === 'Downgrade') {
      this.confirmHeaderMessage = type + ' Package';
      this.confirmBodyMessage = 'Are you sure you want to ' + type.toLowerCase() + ' this package?';
    }
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save'){
      if (this.btnClickType === 'Enable') {
        this.enableAsset();
      } else if (this.btnClickType === 'Disable') {
        this.disableAsset();
      } else if (this.btnClickType === 'Deprovision') {
        this.deleteAsset();
      } else if (this.btnClickType === 'Install' || this.btnClickType === 'Uninstall' ||
      this.btnClickType === 'Upgrade' || this.btnClickType === 'Downgrade') {
        this.updateAssetTwin(this.btnClickType);
      }
      this.btnClickType = undefined;
    } else {
      $('#confirmMessageModal').modal('hide');
      $('#packageManagementModal').modal('hide');
      clearInterval(this.twinResponseInterval);
      this.installPackages = [];
      this.updatePackages = [];
      this.uninstallPackages = [];
      this.selectedAssets = [];
      this.assetPackages = [];
      this.currentAssetApps = [];
      this.displyaMsgArr = [];
      this.assetTwin = undefined;
      this.isAPILoading = false;
      this.isAllAssetSelected = false;
      this.selectedAssetPackage = undefined;
    }
  }

  enableAsset() {
    const asset = this.selectedAssets[0];
    if (asset.status.toLowerCase() === 'enabled') {
      this.toasterService.showError('Asset is already enabled.', 'Enable Asset');
      $('#confirmMessageModal').modal('hide');
      this.selectedAssets = [];
      this.isAllAssetSelected = false;
      return;
    }
    this.isAPILoading = true;
    this.subscriptions.push(this.assetService.enableAsset(asset.asset_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Asset');
        this.isAPILoading = false;
        this.assetsList = [];
        this.selectedAssets = [];
        this.isAllAssetSelected = false;
        this.getAssets();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Enable Asset');
        this.isAPILoading = false;
      }
    ));
  }

  disableAsset() {
    const asset = this.selectedAssets[0];
    if (asset.status.toLowerCase() === 'disabled') {
      this.toasterService.showError('Asset is already disabled.', 'Disable Asset');
      $('#confirmMessageModal').modal('hide');
      this.selectedAssets = [];
      this.isAllAssetSelected = false;
      return;
    }
    this.isAPILoading = true;
    this.subscriptions.push(this.assetService.disableAsset(asset.asset_id, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Asset');
        this.isAPILoading = false;
        this.assetsList = [];
        this.selectedAssets = [];
        this.isAllAssetSelected = false;
        this.getAssets();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Disable Asset');
        this.isAPILoading = false;
      }
    ));
  }

  deleteAsset() {
    const asset = this.selectedAssets[0];
    this.isAPILoading = true;
    let methodToCall;
    if (this.type === CONSTANTS.NON_IP_ASSET) {
      methodToCall = this.assetService.deleteNonIPAsset(asset.asset_id, this.contextApp.app);
    } else {
      methodToCall = this.assetService.deleteAsset(asset.asset_id, this.contextApp.app);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Asset');
        this.isAPILoading = false;
        this.assetsList = [];
        this.selectedAssets = [];
        this.isAllAssetSelected = false;
        const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        if (item) {
          delete item.asset;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, item);
        this.getAssets();
        $('#confirmMessageModal').modal('hide');
      }, error => {
        this.toasterService.showError(error.message, 'Delete Asset');
        this.isAPILoading = false;
      }
    ));
  }

  async openPackageManagementModal() {
    if (this.selectedAssets?.length === 0) {
      this.toasterService.showError('To perform any operations, please select at least one asset', 'Package Management');
      return;
    }
    if (this.selectedAssets.length > 1) {
      this.toasterService.showError('To perform single operations, please select only one asset', 'Package Management');
      return;
    }
    $('#packageManagementModal').modal({ backdrop: 'static', keyboard: false, show: true });
    await this.getAssetModelData();
    await this.getAssetTwinData();
  }

  getAssetModelData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetModelService.getPackages(this.contextApp.app, this.selectedAssets[0].asset_model, {}).subscribe(
          (response: any) => {
            if (response.data?.length > 0) {
              this.assetPackages = response.data;
              this.assetPackages.forEach(packageObj => {
                if (this.assetApps.indexOf(packageObj.name) === -1) {
                  this.assetApps.push(packageObj.name);
                }
                this.applicationList.forEach(app => {
                  if (packageObj.name === app.name) {
                    packageObj['is_install'] = app.is_install;
                    packageObj['is_uninstall'] = app.is_uninstall;
                    packageObj['is_update'] = app.is_update;
                  }
                });
              });
            }
            resolve();
          }
        )
      );
    });
  }

  getAssetTwinData() {
    return new Promise<void>((resolve) => {
      const asset = this.selectedAssets[0];
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
            this.assetPackages.forEach(assetPackage => {
              const index = this.currentAssetApps.findIndex(packageName => packageName === assetPackage.name);
              if (index === -1) {
                  this.installPackages.push(assetPackage);
              }
              this.currentAssetApps.forEach(currentPackage => {
                if (assetPackage.name === currentPackage &&
                  this.assetTwin.twin_properties.reported.installed_packages[currentPackage] === assetPackage.version) {
                    this.uninstallPackages.push(assetPackage);
                }
                if (assetPackage.name === currentPackage &&
                  this.assetTwin.twin_properties.reported.installed_packages[currentPackage] !== assetPackage.version) {
                    this.updatePackages.push(assetPackage);
                }
              });
            });
            } else {
              this.installPackages = JSON.parse(JSON.stringify(this.assetPackages));
            }
            resolve();
          }
        ));
    });
  }

  updateAssetTwin(type) {
    this.isAPILoading = true;
    this.displyaMsgArr = [];
    const obj = {
      desired_properties: {
        package_management: {
          job_id: this.selectedAssets[0].asset_id + '_' + this.commonService.generateUUID(),
          command: null,
          package_details: {
            app_name: this.selectedAssetPackage.name,
            version: this.selectedAssetPackage.version,
            url: environment.blobURL + this.selectedAssetPackage.url,
            token: environment.blobKey,
            job_id: null
          }
        }
      },
      job_id: null,
      timestamp: moment().utc().unix(),
      sub_job_id: null,
      asset_id: this.selectedAssets[0].asset_id,
      request_type: 'FOTA'
    };
    obj.job_id = obj.desired_properties.package_management.job_id;
    obj.sub_job_id = obj.job_id + '_1';
    obj.desired_properties.package_management.package_details.job_id = obj.desired_properties.package_management.job_id;
    if (type === 'Install') {
      obj.desired_properties.package_management.command = 'INSTALL_PACKAGE';
      obj.request_type = 'FOTA - INSTALL_PACKAGE';
    } else if (type === 'Upgrade' || type === 'Downgrade') {
      obj.desired_properties.package_management.command = 'UPGRADE_PACKAGE';
      obj.request_type = 'FOTA - UPGRADE_PACKAGE';
    } else if (type === 'Uninstall') {
      obj.desired_properties.package_management.command = 'DELETE_PACKAGE';
      obj.request_type = 'FOTA - DELETE_PACKAGE';
    }

    this.subscriptions.push(
      this.assetService.updateAssetTwin(this.contextApp.app, this.selectedAssets[0].asset_id, obj).subscribe(
        (response: any) => {
          // this.confirmBodyMessage = response.message;
          this.displyaMsgArr.push({
            message: 'Firmware ' + type.toLowerCase() + ' request sent to Asset.',
            error: false
          });
          this.modalConfig.isDisplaySave = false;
          clearInterval(this.twinResponseInterval);
          this.loadAssetTwinChangeResponse(obj);
        }, error => {
          clearInterval(this.twinResponseInterval);
          this.confirmBodyMessage = error.message;
          this.modalConfig.isDisplaySave = false;
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

  loadAssetTwinChangeResponse(requestObj) {
    clearInterval(this.twinResponseInterval);
    const obj = {
      sub_job_id: requestObj.sub_job_id,
      from_date: requestObj.timestamp - 5,
      to_date: moment().utc().unix(),
      epoch: true,
      job_type: 'Twin'
    };
    this.subscriptions.push(
      this.assetService.getMessageResponseDetails(this.contextApp.app, obj).subscribe(
        (response: any) => {
          response.data.reverse();
          if (response.data.length > 0) {
          this.displyaMsgArr.length = 1;
          response.data.forEach(item => {
            if (item.payload?.reported && item.payload?.reported[this.selectedAssetPackage.name]) {
              this.displyaMsgArr.push({
                message: item.payload.reported[this.selectedAssetPackage.name].fw_update_sub_status,
                error: false
              });
              this.modalConfig.isDisplaySave = false;
              if (item.payload.reported[this.selectedAssetPackage.name].fw_pending_version) {
                clearInterval(this.twinResponseInterval);
                this.twinResponseInterval = setInterval(
                () => {
                  this.loadAssetTwinChangeResponse(requestObj);
                }, 5000);
              } else {
                clearInterval(this.twinResponseInterval);
                setTimeout(() => {
                  this.onModalEvents('close');
                  this.isAPILoading = false;
                }, 1000);
              }
            } else {
              clearInterval(this.twinResponseInterval);
              this.twinResponseInterval = setInterval(
              () => {
                this.loadAssetTwinChangeResponse(requestObj);
              }, 5000);
            }
          });
        } else {
          clearInterval(this.twinResponseInterval);
          this.twinResponseInterval = setInterval(
          () => {
            this.loadAssetTwinChangeResponse(requestObj);
          }, 5000);
          }

        }, error => {
          this.displyaMsgArr.push({
            message: error.message,
            error: true
          });
          this.isAPILoading = false;
          this.modalConfig.isDisplaySave = false;
          clearInterval(this.twinResponseInterval);
        }
      ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
