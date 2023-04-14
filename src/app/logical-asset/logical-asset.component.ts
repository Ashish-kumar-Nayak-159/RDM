import { CONSTANTS } from 'src/app/constants/app.constants';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { CommonService } from '../services/common.service';
import { AssetService } from '../services/assets/asset.service';
import { ToasterService } from '../services/toaster.service';
declare var $: any;

@Component({
  selector: 'app-logical-asset',
  templateUrl: './logical-asset.component.html',
  styleUrls: ['./logical-asset.component.css']
})
export class LogicalAssetComponent implements OnInit {
  contextApp: any;
  tileData: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  componentState;
  constantData = CONSTANTS;
  decodedToken: any;
  isOpenAssetCreateModal = false;
  gateways: any[] = [];
  subscriptions: any[] = [];
  tabData: { tab_name: any; table_key: any };
  assets: any;
  filterObj: any = {};
  logicalAssest: any = [];
  actualhierarchyArr = [];
  parentid: any;
  isGetLogicalAPILoading: boolean;
  modalConfig: {
    isDisplaySave: boolean;
    isDisplayCancel: boolean;
    saveBtnText: string;
    cancelBtnText: string;
    stringDisplay: boolean;
  };
  confirmBodyMessage: string;
  confirmHeaderMessage: string;
  recordID: number;
  isAPILoading = false;
  assetDetail: { name: string; code: string; };
  isShowConfig: boolean;

  constructor(private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService,
  ) {
    this.assetDetail = { name: "", code: "" };

  }

  async ngOnInit(): Promise<void> {

    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getAssets(this.contextApp.user.hierarchy);
    this.actualhierarchyArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);

    this.getTileName();
    this.getLogicalView();
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.NON_IP_ASSET,
      };
      this.subscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
              // this.onChangeOfAsset();
            }
          }
          resolve1();
        })
      );
    });
  }


  getTileName() {
    let selectedItem;
    let assetItem;
    let assetDataItem = {};
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Logical Asset') {
        selectedItem = item.showAccordion;
        assetItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    assetItem.forEach((item) => {
      assetDataItem[item.name] = item.value;
    });

  }

  onCreateAssetCancelModal() {
    this.isOpenAssetCreateModal = false;
    this.getLogicalView();
  }

  openAssetCreateModal() {
    this.assetDetail = { name: "", code: "" };
    this.isOpenAssetCreateModal = true;
  }

  getLogicalView() {
    this.isGetLogicalAPILoading = true;
    this.subscriptions.push(this.assetService.getLogicalView().subscribe((res: any) => {
      this.isGetLogicalAPILoading = false;

      this.logicalAssest = res.data;
      this.logicalAssest.forEach(element => {
        let hierarchy = element.hierarchy;
        let hierarchyString = '';
        if (hierarchy) {
          const keys = Object.keys(hierarchy);
          this.parentid = 0;
          this.contextApp.hierarchy.levels.forEach((key, index) => {
            if (index != 0)
              hierarchyString += hierarchy[key] ? this.getDisplayHierarchyString(index, hierarchy[key], this.parentid) + (keys[index + 1] ? ' / ' : '') : '';
            else
              hierarchyString += hierarchy[key] ? hierarchy[key] + (keys[index + 1] ? ' / ' : '') : '';
          });
        }
        element.hierarchyString = hierarchyString;
      });
    }));
  }

  getDisplayHierarchyString(index, hierarchyKey, parentid = 0) {
    let selectedHierarchy = this.actualhierarchyArr.find(r => r.level == index && r.key == hierarchyKey && r.parent_id == parentid);
    if (selectedHierarchy) {
      this.parentid = selectedHierarchy.id;
      return selectedHierarchy.name;
    }
  }

  async singleRecordData(data: any, type?: string) {

    this.isShowConfig = false;
    this.assetDetail = { name: "", code: "" };
    if (type === 'delete') {
      this.deleteModal(data?.id);
    }
    else if (type === 'view') {
      this.assetDetail = data;
      this.isOpenAssetCreateModal = true;
    }
    else if (type === 'config') {
      this.isShowConfig = true;
      this.assetDetail = data;
    }
  }

  deleteModal(id: number) {
    this.recordID = id;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true,
    };
    this.confirmBodyMessage = 'Are you sure you want to delete this logical asset?';
    this.confirmHeaderMessage = 'Delete ' + 'Logical Asset';
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  // showing and hiding modal
  onModalEvents(eventType) {
    if (eventType === 'save') {
      this.deleteRecord()
      $("#confirmMessageModal").modal('hide');
    }
    else {
      $('#confirmMessageModal').modal('hide');
    }
  }

  deleteRecord() {
    this.assetService.deleteLogicalView(this.recordID).subscribe((response: any) => {
      this.getLogicalView()
      this.toasterService.showSuccess('Logical Asset deleted successfully !', 'Delete Logical Asset')
    })
  }

  onBackBtn() {
    this.isShowConfig = false;
  }

}
