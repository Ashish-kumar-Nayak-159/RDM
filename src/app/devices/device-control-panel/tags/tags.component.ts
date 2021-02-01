import { Subscription } from 'rxjs';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit, OnDestroy {

  @Input() device: Device = new Device();
  @Input() tileData: any;
  originalDevice: Device = new Device();
  deviceCustomTags: any[] = [];
  reservedTags: any[] = [];
  reservedTagsBasedOnProtocol: any[] = [];
  isReservedTagsEditable = false;
  isCustomTagsEditable = false;
  tagsListToNotDelete = ['app', 'created_date', 'created_by', 'device_manager', 'manufacturer',
  'serial_number', 'mac_address', 'protocol', 'cloud_connectivity'];
  tagsListToNotEdit = ['app', 'created_date', 'created_by', 'manufacturer',
  'serial_number', 'mac_address', 'protocol', 'cloud_connectivity'];
  userData: any;
  pageType: string;
  hierarchyTags: any[] = [];
  contextApp: any;
  deviceType: any;
  constantData = CONSTANTS;
  isUpdateAPILoading = false;
  originalDeviceData: any;
  subscriptions: Subscription[] = [];
  modalConfig = {
    isDisplaySave: true,
    isDisplayCancel: true,
    saveBtnText: 'Yes',
    cancelBtnText: 'No',
    stringDisplay: true
  };
  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService  ) { }

  async ngOnInit(): Promise<void> {
    console.log(JSON.stringify(this.device));
    const device = JSON.parse(JSON.stringify(this.device));
    this.device = undefined;
    this.device = JSON.parse(JSON.stringify(device));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(async params => {
      this.pageType = params.get('listName').toLowerCase();
      console.log(this.device);
      // this.device.tags = {};
      this.getDeviceData();
    });
    // this.device.hierarchyString = '';
    // console.log(this.device);
    // let keys = [];
    // if (this.device.hierarchy) {
    //   keys = Object.keys(this.device.hierarchy);
    //   keys.forEach((key, index) => {
    //     this.device.hierarchyString += this.device.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
    //   });
    // }
    // await this.getDeviceTypeDetail();
  }

  getDeviceData() {
    this.device.tags = undefined;
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      const obj = {
        gateway_id: this.device.gateway_id,
        app: this.contextApp.app,
        device_id: this.device.device_id
      };
      methodToCall = this.deviceService.getNonIPDeviceTags(obj);
    } else {
      methodToCall = this.deviceService.getDeviceData(this.device.device_id, this.contextApp.app);
    }

    this.subscriptions.push(methodToCall.subscribe(
      async (response: any) => {
        if (this.pageType === 'nonipdevices' && response && response.tags) {
            this.device.tags = JSON.parse(JSON.stringify(response.tags));
        } else {
          this.device = JSON.parse(JSON.stringify(response));
        }

        if (this.device.tags?.hierarchy_json) {
          this.device.hierarchy = this.device.tags.hierarchy_json;
          // this.device.tags.hierarchy = this.device.tags.hierarchy_json;
        }
        console.log('111111', JSON.stringify(this.device));
        this.device.hierarchyString = '';
        const keys = Object.keys(this.device.hierarchy);
        this.contextApp.hierarchy.levels.forEach((key, index) => {
          this.device.hierarchyString += this.device.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
        });
        console.log(this.device);
        await this.getDeviceTypeDetail();
        this.getDeviceDetail();
      }
    ));
  }

  getDeviceTypeDetail() {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.device.hierarchy),
        name: this.device.device_type,
        app: this.contextApp.app
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
        (response: any) => {
          if (response?.data?.length > 0) {
            this.deviceType = response.data[0];
            console.log(this.deviceType);
            this.deviceType.tags.reserved_tags.forEach(tag => {
              if (tag.defaultValue && !this.device.tags[tag.key] ) {
                this.device.tags[tag.key] = tag.defaultValue;
              }
            });
            console.log(this.device.tags);
          }
          resolve();
        }
      ));
    });
  }

  getDeviceDetail() {
    this.deviceCustomTags = [];
    if (!this.device.tags) {
      this.device.tags = {};
      this.deviceCustomTags = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true
        }
      ];
    } else if (!this.device.tags.custom_tags) {
      this.deviceCustomTags = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true
        }
      ];
    } else {
      Object.keys(this.device.tags.custom_tags).forEach((key, index) => {
        this.deviceCustomTags.push({
          id: index,
          name: key,
          value: this.device.tags.custom_tags[key]
        });
      });
      this.deviceCustomTags.push({
        id: Object.keys(this.device.tags.custom_tags).length,
        name: null,
        value: null,
        editable: true
      });
    }
    if (this.device.tags) {
      if (this.device.tags.created_date) {
        this.device.tags.local_created_date = this.commonService.convertUTCDateToLocal(this.device.tags.created_date);
      }
    }
    this.originalDevice = null;
    this.originalDevice = JSON.parse(JSON.stringify(this.device));
  }

  onCustomTagInputChange() {
    let count = 0;
    console.log(this.device.tags.custom_tags);
    this.deviceCustomTags.forEach((tag, index) => {
      if (tag.name && tag.value && !this.deviceCustomTags[index + 1]) {
        count += 1;
      }
    });
    if (count > 0) {
      this.deviceCustomTags.push({
        name: null,
        value: null,
        editable: true
      });
    }
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  resetDeviceTags(event) {
    if (event === 'save') {
      this.isUpdateAPILoading = true;
      this.device = null;
      this.device = JSON.parse(JSON.stringify(this.originalDevice));
      this.device.hierarchyString = '';
      let keys = [];
      if (this.device.hierarchy) {
        keys = Object.keys(this.device.hierarchy);
        keys.forEach((key, index) => {
          this.device.hierarchyString += this.device.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
        });
      }
      $('#confirmResetTagsModal').modal('hide');
      this.getDeviceDetail();
      this.isUpdateAPILoading = false;
    } else {
      this.isUpdateAPILoading = false;
      $('#confirmResetTagsModal').modal('hide');
    }
  }

  onChangeOfHierarchyTags() {
    this.device.tags.hierarchy = JSON.stringify(this.device.tags.hierarchy_json);
  }

  checkKeyDuplicacy(tagObj, tagIndex) {
    const index = this.deviceCustomTags.findIndex(tag => tag.name === tagObj.name);
    console.log(index);
    if (index !== -1 && index !== tagIndex) {
      this.toasterService.showError('Tag with same name is already exists. Please use different name', 'Set Tags');
      tagObj.name = undefined;
    }
  }

  updateDeviceTags() {
    this.isUpdateAPILoading = true;
    const tagObj = {};
    if (this.device.tags?.custom_tags) {
    Object.keys(this.device.tags.custom_tags).forEach(customTag => {
      let flag = false;
      this.deviceCustomTags.forEach(tag => {
      if (tag.name === customTag) {
        flag = true;
      }
      });
      if (!flag) {
        tagObj[customTag] = null;
      }
    });
    }
    this.deviceCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.device.tags.custom_tags = tagObj;
    const obj = {
      device_id: this.device.device_id,
      display_name: this.device.display_name,
      tags: this.device.tags
    };
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.contextApp.app);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(this.tileData.value + ' tags updated successfully.', 'Set Tags');
        this.getDeviceData();
        this.isReservedTagsEditable = false;
        this.isUpdateAPILoading = false;
        this.isCustomTagsEditable = false;
      }, error => {
        this.toasterService.showError(error.message, 'Set Tags');
        this.isUpdateAPILoading = false;
      }
    ));
  }

  deleteAllDeviceTags(event) {
    if (event === 'save') {
    this.isUpdateAPILoading = true;
    const tagObj = {};
    this.deviceCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = null;
      }
    });
    // (Object.keys(this.device.tags)).forEach(key => {
    //   if (this.tagsListToNotDelete.indexOf(key) === -1 && key !== 'custom_tags') {
    //     this.device.tags[key] = null;
    //   }
    // });
    this.device.tags.custom_tags = tagObj;
    const obj = {
      device_id: this.device.device_id,
      tags: this.device.tags
    };
    console.log(obj);
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.contextApp.app);
    }
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Tags');
        $('#confirmdeleteTagsModal').modal('hide');
        this.device.tags.custom_tags = {};
        this.getDeviceData();
        this.isUpdateAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Delete Tags');
        this.isUpdateAPILoading = false;
      }
    ));
    } else {
      $('#confirmdeleteTagsModal').modal('hide');
    }
  }

  ngOnDestroy() {
    this.device = JSON.parse(JSON.stringify(this.originalDevice));
    console.log('on destroy', this.device);
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
