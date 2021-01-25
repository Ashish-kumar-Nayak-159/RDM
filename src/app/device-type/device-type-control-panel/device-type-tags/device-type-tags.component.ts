import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-device-type-tags',
  templateUrl: './device-type-tags.component.html',
  styleUrls: ['./device-type-tags.component.css']
})
export class DeviceTypeTagsComponent implements OnInit, OnDestroy {

  @Input() deviceType: any;
  isReservedTagsEditable = false;
  reservedTags: any[] = [];
  tagsListToNotDelete = ['app', 'created_date', 'created_by', 'device_manager', 'manufacturer',
  , 'protocol', 'cloud_connectivity'];
  tagsListToNotEdit = ['app', 'created_date', 'created_by', 'manufacturer',
  , 'protocol', 'cloud_connectivity'];
  originalDeviceType: any;
  reservedTagsBasedOnProtocol: any[] = [];
  deviceTypeCustomTags: any[] = [];
  isCustomTagsEditable = false;
  userData: any;
  contextApp: any;
  tagObj: any;
  firstTagAdded = false;
  subscriptions: Subscription[] = [];
  isUpdateTagsAPILoading = false;
  message: string;
  deleteTagIndex: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.originalDeviceType = JSON.parse(JSON.stringify(this.deviceType));
    console.log(this.deviceType);
    this.getDeviceTypeDetail();
    if (!this.deviceType.tags.reserved_tags) {
    this.deviceType.tags.reserved_tags = [];
    }
    if (this.deviceType.metadata.model_type.includes('Gateway')) {
      this.reservedTags.forEach(item => {
        if (item.name.includes('Device')) {
          item.name = item.name.replace('Device', 'Gateway');
        }
      });
    }
    this.reservedTags = this.reservedTags.filter(tag => {
      console.log(tag.name);
      console.log(['Device Type', 'Serial No', 'MAC ID'].indexOf(tag.name) === -1);
      return ['Device Type', 'Serial No', 'MAC ID'].indexOf(tag.name) === -1;
    });
    // this.processTagsData();
  }

  addTagObject() {
    console.log(this.tagObj);
    if (this.tagObj) {
      if (!this.tagObj.name || !this.tagObj.key) {
        this.toasterService.showError('Please add tag name and key', 'Add Tag');
        return;
      }
      let flag = false;
      CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach(char => {
        if (this.tagObj.key.includes(char)) {
          flag = true;
        }
      });
      if (flag) {
        this.toasterService.showError(`Tag key should not contain space, dot, '#' and '$'`, 'Add Tag');
        return;
      }
      flag = false;
      this.deviceType.tags.reserved_tags.forEach(tag => {
        if (tag.key === this.tagObj.key) {
          flag = true;
        }
      });
      if (flag) {
        this.toasterService.showError('Tag with same key is already exists.', 'Add Tag');
        return;
      }
      this.deviceType.tags.reserved_tags.push(this.tagObj);
      console.log(this.deviceType.tags.reserved_tags);
    }
    this.firstTagAdded = true;
    this.tagObj = {};

  }

  removeTag() {
    this.deviceType.tags.reserved_tags.splice(this.deleteTagIndex, 1);
    this.closeModal('confirmMessageModal');
  }

  updateDeviceTypeTags() {
    this.isUpdateTagsAPILoading = true;
    const tagObj = {};
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.tags = this.deviceType.tags;
    obj.app = this.contextApp.app;
    console.log(obj);
    this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.tagObj = undefined;
        this.toasterService.showSuccess(response.message, 'Set Tags');
        this.getDeviceTypeDetail();
        this.firstTagAdded = false;
        this.isUpdateTagsAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Set Tags');
        this.isUpdateTagsAPILoading = false;
      }
    ));
  }

  deleteAllDeviceTypeTags() {

    this.tagObj = undefined;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.tags = this.deviceType.tags;
    obj.tags.reserved_tags = [];
    obj.app = this.contextApp.app;
    console.log(obj);
    this.closeModal('confirmMessageModal');
    // this.subscriptions.push(this.deviceTypeService.updateThingsModel(obj, this.contextApp.app).subscribe(
    //   (response: any) => {
    //     this.toasterService.showSuccess(response.message, 'Delete Tags');
    //     this.getDeviceTypeDetail();
    //     this.firstTagAdded = false;
    //   }, error => this.toasterService.showError(error.message, 'Delete Tags')
    // ));
  }

  openModal(id, type, index) {
    if (type === 'reset') {
      this.message = 'All the unsaved changes will removed. Are you sure you want to reset the tags?';
    } else {
      this.message = 'All the devices with this model will get affected. Are you sure you want to remove ' + (type === 'all' ? 'all tags?' : 'this tag?');
    }
    this.deleteTagIndex =  index;
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  closeModal(id) {
    this.message = undefined;
    this.deleteTagIndex = undefined;
    $('#' + id).modal('hide');
  }


  resetDeviceTypeTags() {
    this.deviceType = null;
    this.deviceType = JSON.parse(JSON.stringify(this.originalDeviceType));
    this.getDeviceTypeDetail();
    this.tagObj = undefined;
    this.firstTagAdded = false;
    this.closeModal('confirmMessageModal');
  }

  getDeviceTypeDetail() {
    const obj = {
      name: this.deviceType.name,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.deviceType = response.data[0];
        }
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
