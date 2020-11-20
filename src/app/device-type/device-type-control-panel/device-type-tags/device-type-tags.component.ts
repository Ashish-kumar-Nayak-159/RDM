import { ApplicationService } from 'src/app/services/application/application.service';
import { ToasterService } from './../../../services/toaster.service';
import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-device-type-tags',
  templateUrl: './device-type-tags.component.html',
  styleUrls: ['./device-type-tags.component.css']
})
export class DeviceTypeTagsComponent implements OnInit {

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
  applicationData: any;
  appName: any;
  constructor(
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(async params => {
      this.appName = params.get('applicationId');
      this.applicationData = this.userData.apps.filter(app => app.app === params.get('applicationId'))[0];
      await this.getApplicationData();
    });
    this.originalDeviceType = JSON.parse(JSON.stringify(this.deviceType));
    this.reservedTags = CONSTANTS.DEVICE_RESERVED_TAGS_LIST;
    console.log(this.deviceType);
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
    this.processTagsData();
  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.contextApp = response;
            this.contextApp.user = this.applicationData.user;
            resolve();
        });
    });
  }


  processTagsData() {
      this.deviceTypeCustomTags = [];
      if (!this.deviceType.tags) {
        this.deviceType.tags = {};
        this.deviceTypeCustomTags = [
          {
            name: null,
            value: null,
            editable: true
          }
        ];
      } else if (!this.deviceType.tags.custom_tags) {
        this.deviceTypeCustomTags = [
          {
            name: null,
            value: null,
            editable: true
          }
        ];
      } else {
        Object.keys(this.deviceType.tags.custom_tags).forEach(key => {
          this.deviceTypeCustomTags.push({
            name: key,
            value: this.deviceType.tags.custom_tags[key]
          });
        });
        this.deviceTypeCustomTags.push({
          name: null,
          value: null,
          editable: true
        });
      }
      if (this.deviceType.tags && this.deviceType.tags.protocol) {
        if (this.deviceType.created_date) {
          this.deviceType.tags.local_created_date = this.commonService.convertUTCDateToLocal(this.deviceType.created_date);
        }
        this.reservedTagsBasedOnProtocol = CONSTANTS.DEVICE_PROTOCOL_BASED_TAGS_LIST[this.deviceType.tags.protocol]
        ? CONSTANTS.DEVICE_PROTOCOL_BASED_TAGS_LIST[this.deviceType.tags.protocol] : [];
      }
      console.log(this.reservedTagsBasedOnProtocol);
      this.deviceType.tags.created_by = this.deviceType.created_by;
      this.deviceType.tags.app = this.deviceType.app;
      this.originalDeviceType = null;
      console.log('aaaaaaaaaaaaaaaaa', this.deviceType);
      this.originalDeviceType = JSON.parse(JSON.stringify(this.deviceType));
  }

  onCustomTagInputChange() {
    let count = 0;
    console.log(this.deviceType.tags.custom_tags);
    this.deviceTypeCustomTags.forEach((tag, index) => {
      if (tag.name && tag.value && !this.deviceTypeCustomTags[index + 1]) {
        count += 1;
      }
    });
    if (count > 0) {
      this.deviceTypeCustomTags.push({
        name: null,
        value: null,
        editable: true
      });
    }
  }

  updateDeviceTypeTags() {
    const tagObj = {};
    this.deviceTypeCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.deviceType.tags.custom_tags = tagObj;
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.tags = this.deviceType.tags;
    obj.app = this.contextApp.app;
    console.log(obj);
    this.deviceTypeService.updateThingsModel(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Set Tags');
        this.getDeviceTypeDetail();
        this.isReservedTagsEditable = false;
      }, error => this.toasterService.showError(error.message, 'Set Tags')
    );
  }

  deleteAllDeviceTypeTags() {
    (Object.keys(this.deviceType.tags)).forEach(key => {
      if (this.tagsListToNotDelete.indexOf(key) === -1 && key !== 'custom_tags') {
        this.deviceType.tags[key] = null;
      }
    });
    this.deviceType.tags.custom_tags = {};
    const obj = JSON.parse(JSON.stringify(this.deviceType));
    obj.tags = this.deviceType.tags;
    obj.app = this.contextApp.app;
    console.log(obj);
    this.deviceTypeService.updateThingsModel(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Tags');
        this.getDeviceTypeDetail();
      }, error => this.toasterService.showError(error.message, 'Delete Tags')
    );
  }

  resetDeviceTypeTags() {
    this.deviceType = null;
    this.deviceType = JSON.parse(JSON.stringify(this.originalDeviceType));
    this.getDeviceTypeDetail();
  }

  getDeviceTypeDetail() {
    const obj = {
      name: this.deviceType.name,
      app: this.contextApp.app
    };
    this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.deviceType = response.data[0];
          this.processTagsData();
        }
      }
    );
  }

}
