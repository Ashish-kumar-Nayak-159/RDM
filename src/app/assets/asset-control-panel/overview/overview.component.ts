import { CONSTANTS } from 'src/app/app.constants';
import { Subscription } from 'rxjs';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AssetService } from './../../../services/assets/asset.service';
import { Asset } from 'src/app/models/asset.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ApplicationService } from './../../../services/application/application.service';
import { environment } from './../../../../environments/environment';
import { ToasterService } from 'src/app/services/toaster.service';
import { JsonEditorOptions } from 'ang-jsoneditor';
declare var $: any;

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {

  @Input() asset: Asset = new Asset();
  assetCredentials: any;
  assetConnectionStatus: any;
  userData: any;
  isCopyClicked = false;
  isViewClicked = false;
  contextApp: any;
  blobSASToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  // pageType: string;
  assetCount = null;
  isAPILoading = false;
  modalConfig: any;
  btnClickType: string;
  confirmModalMessage: string;
  constantData = CONSTANTS;
  @Input() tileData: any;
  @Input() menuDetail: any;
  @Input() componentState: any;
  assetModel: any;
  subscriptions: Subscription[] = [];
  isAssetTwinLoading = false;
  assetTwin: any;
  editorOptions: JsonEditorOptions;
  isSyncAPILoading = false;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private assetModelService: AssetModelService,
    private assetService: AssetService,
    private toasterService: ToasterService,
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      this.getAssetCredentials();
      this.getAssetModelDetail();
      if (this.componentState === CONSTANTS.IP_GATEWAY) {
        this.getAssetCount();
      }
    }));
  }


  getAssetCredentials() {
    this.assetCredentials = undefined;
    console.log(this.asset);
    const id = (this.componentState === CONSTANTS.NON_IP_ASSET) ? this.asset.gateway_id : this.asset.asset_id;
    this.subscriptions.push(this.assetService.getAssetCredentials(id, this.contextApp.app).subscribe(
      response => {
        this.assetCredentials = response;
      }
    ));
  }

  getAssetModelDetail() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.asset.tags.hierarchy_json),
        name: this.asset.tags.asset_model,
        app: this.contextApp.app
      };
      this.subscriptions.push(this.assetModelService.getThingsModelDetails(obj.app, obj.name).subscribe(
        (response: any) => {
          if (response) {
            this.assetModel = response;
            this.assetModel.name = obj.name;
            this.assetModel.app = obj.app;
            if (!this.assetModel.metadata?.image) {
              this.assetModel.metadata.image = {
                url: CONSTANTS.DEFAULT_MODEL_IMAGE
              };
            }
          }
          resolve();
        }
      ));
    });
  }

  onRedirectToAssets() {
    let data = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY);
    if (!data) {
      data = {};
    }
    data['gateway_id'] = this.asset.asset_id;
    data['type'] = CONSTANTS.NON_IP_ASSET;
    this.commonService.setItemInLocalStorage(CONSTANTS.ASSET_LIST_FILTER_FOR_GATEWAY, data);
    this.router.navigate(['applications', this.contextApp.app, 'assets']);
  }

  onRedirectToGateway(asset) {
    this.router.navigate(['applications', this.contextApp.app, 'assets', asset.gateway_id, 'control-panel']);
  }

  onRedirectToModel(asset) {
    this.router.navigate(['applications', this.contextApp.app, 'things', 'model', asset?.tags?.asset_model, 'control-panel']);
  }

  getAssetCount() {
    this.assetCount = null;
    const obj = {
      app: this.contextApp.app,
      gateway_id: this.asset.asset_id
    };
    this.subscriptions.push(this.assetService.getNonIPAssetCount(obj).subscribe(
      (response: any) => {
        this.assetCount = response.count;
      }
    ));
  }

  syncWithCache() {
    this.isSyncAPILoading = true;
    const obj = {
      asset_id: this.asset.asset_id
    };
    this.subscriptions.push(this.assetService.syncAssetCache(this.assetModel.app, obj)
    .subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Sync Asset Data');
      this.isSyncAPILoading = false;
    }, error => {
      this.toasterService.showError(error.message, 'Sync Asset Data');
      this.isSyncAPILoading = false;
    }));
  }

  copyConnectionString() {
    this.isCopyClicked = true;
    navigator.clipboard.writeText(this.assetCredentials.primary_connection_string);
    setTimeout(() => this.isCopyClicked = false, 1000);
  }

  viewonnectionString() {
    this.isViewClicked = true;
  }

  hideConnectionString() {
    this.isViewClicked = false;
  }

  viewAssetTwin() {
    $('#assetTwinModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.isAssetTwinLoading = true;
    this.subscriptions.push( this.assetService.getAssetTwin(this.contextApp.app, this.asset.asset_id).subscribe(
      response => {
        this.assetTwin = response;
        this.isAssetTwinLoading = false;
      }, error => this.isAssetTwinLoading = false
    ));
  }

  onModalClose() {
    $('#assetTwinModal').modal('hide');
    this.isAssetTwinLoading = false;
    this.assetTwin = undefined;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
