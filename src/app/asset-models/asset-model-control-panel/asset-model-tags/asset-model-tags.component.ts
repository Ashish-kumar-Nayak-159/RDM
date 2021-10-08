import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { ToasterService } from './../../../services/toaster.service';
import { AssetModelService } from './../../../services/asset-model/asset-model.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-asset-model-tags',
  templateUrl: './asset-model-tags.component.html',
  styleUrls: ['./asset-model-tags.component.css'],
})
export class AssetModelTagsComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  isReservedTagsEditable = false;
  reservedTags: any[] = [];
  tagsListToNotDelete = [
    'app',
    'created_date',
    'created_by',
    'asset_manager',
    'manufacturer',
    ,
    'protocol',
    'cloud_connectivity',
  ];
  tagsListToNotEdit = ['app', 'created_date', 'created_by', 'manufacturer', , 'protocol', 'cloud_connectivity'];
  originalAssetModel: any;
  reservedTagsBasedOnProtocol: any[] = [];
  assetModelCustomTags: any[] = [];
  isCustomTagsEditable = false;
  userData: any;
  contextApp: any;
  tagObj: any;
  firstTagAdded = false;
  subscriptions: Subscription[] = [];
  isUpdateTagsAPILoading = false;
  message: string;
  deleteTagIndex: any;
  decodedToken: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) {}

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.originalAssetModel = JSON.parse(JSON.stringify(this.assetModel));
    this.getAssetModelDetail();
    if (!this.assetModel.tags.reserved_tags) {
      this.assetModel.tags.reserved_tags = [];
    }
    // if (this.assetModel.metadata.model_type.includes('Gateway')) {
    //   this.reservedTags.forEach(item => {
    //     if (item.name.includes('Asset')) {
    //       item.name = item.name.replace('Asset', 'Gateway');
    //     }
    //   });
    // }
    // this.processTagsData();
  }

  addTagObject() {
    if (this.tagObj) {
      if (!this.tagObj.name || !this.tagObj.key) {
        this.toasterService.showError('Please add tag name and key', 'Add Tag');
        return true;
      }
      let flag = false;
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach((char) => {
        if (this.tagObj.key.includes(char)) {
          flag = true;
        }
      });
      if (flag) {
        this.toasterService.showError(`Tag key should not contain space, dot, '#' and '$'`, 'Add Tag');
        return true;
      }
      flag = false;
      this.assetModel.tags.reserved_tags.forEach((tag) => {
        if (tag.key === this.tagObj.key.trim()) {
          flag = true;
        }
      });
      if (flag) {
        this.toasterService.showError('Tag with same key is already exists.', 'Add Tag');
        return true;
      }
      this.assetModel.tags.reserved_tags.push(this.tagObj);
    }
    this.firstTagAdded = true;
    this.tagObj = {};
  }

  removeTag() {
    this.assetModel.tags.reserved_tags.splice(this.deleteTagIndex, 1);
    this.closeModal('confirmMessageModal');
  }

  async updateAssetModelTags() {
    this.isUpdateTagsAPILoading = true;
    let isNotValid = await this.addTagObject();
    if (isNotValid) {
      this.firstTagAdded = false;
      this.isUpdateTagsAPILoading = false;
      return;
    }
    const tagObj = {};
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.tags = this.assetModel.tags;
    obj.app = this.contextApp.app;
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.updateAssetsModel(obj, this.contextApp.app).subscribe(
        (response: any) => {
          this.tagObj = undefined;
          this.toasterService.showSuccess(response.message, 'Set Tags');
          this.getAssetModelDetail();
          this.firstTagAdded = false;
          this.isUpdateTagsAPILoading = false;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Set Tags');
          this.isUpdateTagsAPILoading = false;
        }
      )
    );
  }

  deleteAllAssetModelTags() {
    this.tagObj = undefined;
    const obj = JSON.parse(JSON.stringify(this.assetModel));
    obj.tags = this.assetModel.tags;
    obj.tags.reserved_tags = [];
    this.assetModel.tags.reserved_tags.push({
      name: 'Protocol',
      key: 'protocol',
      defaultValue: this.assetModel.tags.protocol,
      nonEditable: true,
    });
    console.log(this.assetModel.tags);
    this.assetModel.tags.reserved_tags.push({
      name: 'Cloud Connectivity',
      key: 'cloud_connectivity',
      defaultValue: this.assetModel.tags.cloud_connectivity,
      nonEditable: true,
    });
    obj.app = this.contextApp.app;
    this.closeModal('confirmMessageModal');
  }

  openModal(id, type, index) {
    if (type === 'reset') {
      this.message = 'All the unsaved changes will removed. Are you sure you want to reset the tags?';
    } else {
      this.message =
        'All the assets with this model will get affected. Are you sure you want to remove ' +
        (type === 'all' ? 'all tags?' : this.assetModel?.tags?.reserved_tags[index]?.name + ' tag?');
    }
    this.modalConfig = {
      stringDisplay: true,
      isDisplaySave: true,
      isDisplayCancel: true,
    };
    this.deleteTagIndex = index;
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.closeModal('confirmMessageModal');
    } else if (eventType === 'save') {
      if (this.message.includes('reset')) {
        this.resetAssetModelTags();
      } else {
        if (this.deleteTagIndex !== undefined) {
          this.removeTag();
        } else {
          this.deleteAllAssetModelTags();
        }
      }
    }
  }

  closeModal(id) {
    this.message = undefined;
    this.deleteTagIndex = undefined;
    $('#' + id).modal('hide');
  }

  resetAssetModelTags() {
    this.assetModel = null;
    this.assetModel = JSON.parse(JSON.stringify(this.originalAssetModel));
    this.getAssetModelDetail();
    this.tagObj = undefined;
    this.firstTagAdded = false;
    this.closeModal('confirmMessageModal');
  }

  getAssetModelDetail() {
    return new Promise<void>((resolve) => {
      const obj = {
        name: this.assetModel.name,
        app: this.contextApp.app,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelDetails(obj.app, obj.name).subscribe((response: any) => {
          if (response) {
            this.assetModel = response;
            this.assetModel.name = obj.name;
            this.assetModel.app = obj.app;
            if (!this.assetModel.tags.reserved_tags) {
              this.assetModel.tags.reserved_tags = [];
            }
          }
          resolve();
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
