import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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
  selector: 'app-add-logical-asset',
  templateUrl: './add-logical-asset.component.html',
  styleUrls: ['./add-logical-asset.component.css']
})
export class AddLogicalAssetComponent implements OnInit, OnChanges {
  @Input() tileData: any;
  @Input() filterObj: any;
  // @Output() getAssetEmit: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() assetDetail: any;
  private _type: any;
  public get type(): any {
    return this._type;
  }
  @Input()
  public set type(value: any) {
    this._type = value;
    if (this.type === 'view') {
      this.isAssetEditable = true;
    }
    else {
      this.isAssetEditable = false;

    }
  }
  isCreateAssetAPILoading = false;
  decodedToken: any;
  contextApp: any;
  addAssetConfigureHierarchy = {};
  addAssetHierarchyArr: any[] = [];
  constantData = CONSTANTS;
  appUsers: any[] = [];
  filteredUsers: any[] = [];
  @Input() assets: any[] = [];
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
  originalAssets: any;
  actualAssets: any;
  showAsset: any;
  selectedAsset: any = []
  parentid: any;
  isViewLogicalAssest: boolean;

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

    this.actualhierarchyArr = this.commonService.getItemFromLocalStorage(CONSTANTS.HIERARCHY_TAGS);
    // this.originalGateways = JSON.parse(JSON.stringify(this.gateways));
    // this.actualGateways = this.gateways;
    this.originalAssets = JSON.parse(JSON.stringify(this.assets));
    this.actualAssets = this.originalAssets;

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

    if (this.assetDetail && this.assetDetail?.assets) {
      this.selectedAsset = this.assetDetail?.assets;
      this.isViewLogicalAssest = true;
      let selectAsset = [];
      this.assetDetail.assets.forEach(element => {
        let data = this.assets.find(x => x.asset_id === element.asset_id && x.gateway_id === element.gateway_id);
        if (data) {
          selectAsset.push(data);
        }
      });
      this.selectedAsset = selectAsset;
    }
    else {
      this.isViewLogicalAssest = false;

    }


    $('#createAssetModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.originalAssets = this.actualAssets;
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
    // Object.keys(hierarchyObj).forEach((key) => {
    //   this.whiteListedAssetsfilter = this.whiteListedAssets?.filter(f => f?.hierarchy_json == null || f?.hierarchy_json[key] == hierarchyObj[key])
    // })
    //let maxObject = hierarchyObj.fin
    if (Object.keys(hierarchyObj).length === 1) {
      this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      this.filteredUsers = this.appUsers;
    } else {
      const arr = [];
      this.assets = [];
      this.updateAssetManagerWithHierarchy(hierarchyObj);
      this.originalAssets.forEach((asset) => {
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
      this.assets = JSON.parse(JSON.stringify(arr));
    }
    if (this.showAsset) {
      if (this.assets?.length === 1) {
        this.filterObj.asset = this.assets[0];
      }
      this.filterObj.assetArr = undefined;
      this.filterObj.asset = undefined;
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
    this.selectedAsset = [];
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

  onUpdateAsset() {
  }

  onCreateAsset() {
    if (this.selectedAsset.length == 0) {
      this.toasterService.showError("please select assest", 'Save Logical Assest');
      return
    }
    this.assetDetail.tags = {}
    this.assetDetail.tags.hierarchy_json = {};
    this.assetDetail.tags.hierarchy_json = { App: this.contextApp.app };

    Object.keys(this.addAssetConfigureHierarchy).forEach((key) => {
      this.assetDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] =
        this.addAssetConfigureHierarchy[key];
    });
    let hierarchy_ids = {};
    let parentId = 0;
    debugger
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

    let assest = [];
    this.selectedAsset.forEach(element => {
      let obj = {
        asset_id: element.asset_id,
        gateway_id: element.gateway_id
      }
      assest.push(obj);
    });

    let reqObj = {
      "name": this.assetDetail.name,
      "code": this.assetDetail.code,
      "level": this.selectedHierarchy.level ? this.selectedHierarchy.level : 0,
      "hierarchyid": this.selectedHierarchy.id ? this.selectedHierarchy.id : 0,
      "hierarchy": this.assetDetail.tags.hierarchy_json,
      "assets": assest
    }

    this.subscriptions.push(this.assetService.createLogicalView(reqObj).subscribe(res => {
      this.toasterService.showSuccess(res["message"], 'Logical Assest');
      this.onCloseCreateAssetModal();
    }, error => {
      this.toasterService.showError(error["message"], 'Logical Assest');
    }));


  }

  onCloseCreateAssetModal() {
    $('#createAssetModal').modal('hide');
    this.cancelModal.emit();
  }




}

