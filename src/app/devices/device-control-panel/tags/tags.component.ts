import { ApplicationService } from 'src/app/services/application/application.service';
import { filter } from 'rxjs/operators';
import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css']
})
export class TagsComponent implements OnInit {

  @Input() device: Device = new Device();
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
  appName: string;
  hierarchyTags: any[] = [];
  contextApp: any;
  applicationData: any;
  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(async params => {
      this.appName = params.get('applicationId');
      this.applicationData = this.userData.apps.filter(app => app.app === this.appName)[0];
      await this.getApplicationData();
      this.pageType = params.get('listName').toLowerCase();
      this.getDeviceDetail();
    });
    this.reservedTags = CONSTANTS.DEVICE_RESERVED_TAGS_LIST;
    if (this.pageType === 'gateways') {
      this.reservedTags.forEach(item => {
        if (item.name.includes('Device')) {
          item.name = item.name.replace('Device', 'Gateway');
        }
      });
    }

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

  getDeviceData() {
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      const obj = {
        app: this.appName,
        device_id: this.device.device_id,
        gateway_id: this.device.gateway_id
      };
      methodToCall = this.deviceService.getNonIPDeviceList(obj);
    } else {
      methodToCall = this.deviceService.getDeviceData(this.device.device_id, this.appName);
    }
    methodToCall.subscribe(
      (response: any) => {
        if (this.pageType === 'nonipdevices') {
          if (response && response.data) {
            this.device = response.data[0];
          }
        } else {
          this.device = response;
        }
        this.getDeviceDetail();
      }
    );
  }

  getDeviceDetail() {
    this.deviceCustomTags = [];
    if (!this.device.tags) {
      this.device.tags = {};
      this.deviceCustomTags = [
        {
          name: null,
          value: null,
          editable: true
        }
      ];
    } else if (!this.device.tags.custom_tags) {
      this.deviceCustomTags = [
        {
          name: null,
          value: null,
          editable: true
        }
      ];
    } else {
      Object.keys(this.device.tags.custom_tags).forEach(key => {
        this.deviceCustomTags.push({
          name: key,
          value: this.device.tags.custom_tags[key]
        });
      });
      this.deviceCustomTags.push({
        name: null,
        value: null,
        editable: true
      });
    }
    if (this.device.tags && this.device.tags.protocol) {
      if (this.device.tags.created_date) {
        this.device.tags.local_created_date = this.commonService.convertUTCDateToLocal(this.device.tags.created_date);
      }
      this.reservedTagsBasedOnProtocol = CONSTANTS.DEVICE_PROTOCOL_BASED_TAGS_LIST[this.device.tags.protocol]
      ? CONSTANTS.DEVICE_PROTOCOL_BASED_TAGS_LIST[this.device.tags.protocol] : [];
    }
    console.log(this.reservedTagsBasedOnProtocol);
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

  resetDeviceTags() {
    this.device = null;
    this.device = JSON.parse(JSON.stringify(this.originalDevice));
    this.getDeviceDetail();
  }

  onChangeOfHierarchyTags() {
    this.device.tags.hierarchy = JSON.stringify(this.device.tags.hierarchy_json);
  }

  updateDeviceTags() {
    const tagObj = {};
    this.deviceCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.device.tags.custom_tags = tagObj;
    const obj = {
      device_id: this.device.device_id,
      tags: this.device.tags
    };
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.appName);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.appName);
    }
    methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Set Tags');
        this.getDeviceData();
        this.isReservedTagsEditable = false;
      }, error => this.toasterService.showError(error.message, 'Set Tags')
    );
  }

  deleteAllDeviceTags() {
    const tagObj = {};
    this.deviceCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = null;
      }
    });
    (Object.keys(this.device.tags)).forEach(key => {
      if (this.tagsListToNotDelete.indexOf(key) === -1 && key !== 'custom_tags') {
        this.device.tags[key] = null;
      }
    });
    this.device.tags.custom_tags = tagObj;
    const obj = {
      device_id: this.device.device_id,
      tags: this.device.tags
    };
    console.log(obj);
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.appName);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.appName);
    }
    methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Tags');
        this.getDeviceData();

      }, error => this.toasterService.showError(error.message, 'Delete Tags')
    );
  }

}
