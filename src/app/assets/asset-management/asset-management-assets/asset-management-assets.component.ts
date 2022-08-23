import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from './../../../services/common.service';
import { ToasterService } from './../../../services/toaster.service';
declare var $: any;
@Component({
  selector: 'app-asset-management-assets',
  templateUrl: './asset-management-assets.component.html',
  styleUrls: ['./asset-management-assets.component.css'],
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
  modalConfig: {
    isDisplaySave: boolean;
    isDisplayCancel: boolean;
    saveBtnText: string;
    cancelBtnText: string;
    stringDisplay: boolean;
  };
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
  displyaMsgArr = [];
  applicationList: any[] = CONSTANTS.ASSETAPPPS;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  tabData: any;
  decodedToken: any;
  selectedAsset: any;
  isAllocation = undefined;
  allocationObj: any;
  filteredUsers: any[] = [];
  parentid:any;
  actualhierarchyNewArr = [];

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.actualhierarchyNewArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
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
        if (
          parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
          parseFloat(element.scrollHeight.toFixed(0)) &&
          !this.insideScrollFunFlag
        ) {
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
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
    };
    this.subscriptions.push(
      this.assetService.getIPAssetsAndGateways(obj, this.contextApp.app).subscribe((response: any) => {
        if (response.data) {
          this.gateways = response.data;
          this.assetsList.forEach((item) => {
            const name = this.gateways.filter((gateway) => gateway.asset_id === item.gateway_id)[0]?.display_name;
            item.gateway_display_name = name ? name : item.gateway_id;
          });
        }
      })
    );
  }

  getDisplayHierarchyString(index, hierarchyKey, parentid = 0) {
    let selectedHierarchy = this.actualhierarchyNewArr.find(r => r.level == index && r.key == hierarchyKey && r.parent_id == parentid);
    if (selectedHierarchy) {
      this.parentid = selectedHierarchy.id;
      return selectedHierarchy.name;
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    if (this.type === CONSTANTS.IP_ASSET) {
      this.tabData = {
        tab_name: this.tileData['IoT Assets Tab Name'],
        table_key: this.tileData['IoT Assets Table Key Name'],
        name: this.tileData['IoT Asset'],
      };
    }
    if (this.type === CONSTANTS.NON_IP_ASSET) {
      this.tabData = {
        tab_name: this.tileData['Legacy Assets Tab Name'],
        table_key: this.tileData['Legacy Assets Table Key Name'],
        name: this.tileData['Legacy Asset'],
      };
    }
    if (this.type === CONSTANTS.IP_GATEWAY) {
      this.tabData = {
        tab_name: this.tileData['IoT Gateways Tab Name'],
        table_key: this.tileData['IoT Gateways Table Key Name'],
        name: this.tileData['IoT Gateway'],
      };
    }
    this.currentLimit = this.tileData && this.tileData[2] ? Number(this.tileData[2]?.value) : 20;
  }

  async getAssets(flag = true): Promise<void> {
    this.isAssetListLoading = true;
    if (flag) {
      await this.getNonProvisionedAssets();
    }
    const obj: any = {};
    obj.app = this.contextApp.app;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    // obj.provision_status = 'Pending,Completed';
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
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          if (response.data) {
            response.data.forEach((item) => {
              if (!item.display_name) {
                item.display_name = item.asset_id;
              }
              if (item.hierarchy) {
                item.hierarchyString = '';
                const keys = Object.keys(item.hierarchy);
                this.parentid = 0;
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                if(index != 0)
                item.hierarchyString +=  item.hierarchy[key] ? this.getDisplayHierarchyString(index,item.hierarchy[key],this.parentid) + (keys[index + 1] ? ' / ' : '') : '';
                else
                item.hierarchyString +=  item.hierarchy[key] ? item.hierarchy[key] + (keys[index + 1] ? ' / ' : '') : '';
              });
              }
              if (this.type === CONSTANTS.NON_IP_ASSET) {
                const name = this.gateways.filter((gateway) => gateway.asset_id === item.gateway_id)[0]?.display_name;
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
        },
        (error) => {
          this.isAssetListLoading = false;
          this.insideScrollFunFlag = false;
        }
      )
    );
  }

  getNonProvisionedAssets() {
    return new Promise<void>((resolve1) => {
      this.isAssetListLoading = true;
      const obj: any = {};
      obj.type = this.type;
      this.subscriptions.push(
        this.assetService.getNonProvisionedAsset(obj, this.contextApp.app).subscribe(
          (response: any) => {
            if (response.data) {
              response.data.forEach((item) => {
                if (!item.display_name) {
                  item.display_name = item.asset_id;
                }
                if (item.hierarchy) {
                  item.hierarchyString = '';
                  const keys = Object.keys(item.hierarchy);
                  this.parentid = 0;
              this.contextApp.hierarchy.levels.forEach((key, index) => {
                if(index != 0)
                item.hierarchyString +=  item.hierarchy[key] ? this.getDisplayHierarchyString(index,item.hierarchy[key],this.parentid) + (keys[index + 1] ? ' / ' : '') : '';
                else
                item.hierarchyString +=  item.hierarchy[key] ? item.hierarchy[key] + (keys[index + 1] ? ' / ' : '') : '';
              });
                }
                if (!item.provision_status) {
                  item.provision_status = 'Pending';
                }
              });
              this.assetsList = [...this.assetsList, ...response.data];
            }
            resolve1();
            this.isAssetListLoading = false;
          },
          (error) => {
            this.isAssetListLoading = false;
          }
        )
      );
    });
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
    this.selectedAsset = undefined;
  }

  onAssetSelection(asset) {
    if (this.selectedAssets.length === 0) {
      this.selectedAssets.push(asset);
    } else {
      const index = this.selectedAssets.findIndex((assetObj) => assetObj.asset_id === asset.asset_id);
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
    const index = this.selectedAssets.findIndex((assetObj) => assetObj.asset_id === asset.asset_id);
    if (index > -1) {
      return true;
    }
    return false;
  }

  onSingleOperationClick(type, asset) {
    this.selectedAssets = [];
    this.selectedAssets.push(asset);
    if (!type.toLowerCase().includes('provision') && this.type === CONSTANTS.NON_IP_ASSET) {
      this.toasterService.showError(
        `You can't perform this operation on ` + this.tabData.name + `.`,
        'Asset Management'
      );
      return;
    }
    if (type === 'Deprovision' || type === 'Enable' || type === 'Disable') {
      this.openConfirmDialog(type);
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
    if (type === 'Enable') {
      this.confirmBodyMessage = 'Are you sure you want to enable this asset?';
      this.confirmHeaderMessage = 'Enable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Disable') {
      this.confirmBodyMessage =
        'This ' +
        (this.tabData?.table_key || 'Asset') +
        ' will be temporarily disabled. Are you sure you want to continue?';
      this.confirmHeaderMessage = 'Disable ' + (this.tabData?.table_key || 'Asset');
    } else if (type === 'Deprovision') {
      this.confirmHeaderMessage = 'Deprovision ' + (this.tabData?.table_key || 'Asset');
      if (this.type !== CONSTANTS.NON_IP_ASSET) {
        this.confirmBodyMessage =
          'This ' +
          (this.tabData?.table_key || 'Asset') +
          ' will be permanently deleted. Instead, you can temporarily disable the ' +
          (this.tabData?.table_key || 'Asset') +
          '.' +
          ' Are you sure you want to continue?';
      } else {
        this.confirmBodyMessage =
          'This ' +
          (this.tabData?.table_key || 'Asset') +
          ' will be permanently deleted.' +
          ' Are you sure you want to continue?';
      }
    }
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save') {
      if (this.btnClickType === 'Enable') {
        this.enableAsset();
      } else if (this.btnClickType === 'Disable') {
        this.disableAsset();
      } else if (this.btnClickType === 'Deprovision') {
        this.deleteAsset();
      }
      this.btnClickType = undefined;
    } else {
      $('#confirmMessageModal').modal('hide');
      clearInterval(this.twinResponseInterval);
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
    this.subscriptions.push(
      this.assetService.enableAsset(asset.asset_id, this.contextApp.app).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Enable Asset');
          this.isAPILoading = false;
          this.assetsList = [];
          this.selectedAssets = [];
          this.isAllAssetSelected = false;
          this.getAssets();
          $('#confirmMessageModal').modal('hide');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Enable Asset');
          this.isAPILoading = false;
        }
      )
    );
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
    this.subscriptions.push(
      this.assetService.disableAsset(asset.asset_id, this.contextApp.app).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Disable Asset');
          this.isAPILoading = false;
          this.assetsList = [];
          this.selectedAssets = [];
          this.isAllAssetSelected = false;
          this.getAssets();
          $('#confirmMessageModal').modal('hide');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Disable Asset');
          this.isAPILoading = false;
        }
      )
    );
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
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Delete Asset');
          this.isAPILoading = false;
          this.assetsList = [];
          this.selectedAssets = [];
          this.isAllAssetSelected = false;
          const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
          if (item) {
            delete item.assets;
          }
          this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, item);
          this.getAssets();
          $('#confirmMessageModal').modal('hide');
        },
        (error) => {
          this.toasterService.showError(error.message, 'Delete Asset');
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

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}