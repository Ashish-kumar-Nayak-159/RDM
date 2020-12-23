import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
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
  hierarchyTags: any[] = [];
  contextApp: any;
  deviceType: any;
  constantData = CONSTANTS;
  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(async params => {
      this.pageType = params.get('listName').toLowerCase();
      console.log(this.device);
      this.getDeviceDetail();
    });
    this.device.hierarchyString = '';
    const keys = Object.keys(this.device.hierarchy);
    keys.forEach((key, index) => {
      this.device.hierarchyString += this.device.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
    });
    await this.getDeviceTypeDetail();
  }

  getDeviceData() {
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      const obj = {
        gateway_id: this.device.gateway_id,
        app: this.device.app,
        device_id: this.device.device_id
      };
      methodToCall = this.deviceService.getNonIPDeviceTags(obj);
    } else {
      methodToCall = this.deviceService.getDeviceData(this.device.device_id, this.contextApp.app);
    }
    methodToCall.subscribe(
      async (response: any) => {
        if (this.pageType === 'nonipdevices') {
          if (response && response.data) {
            this.device.tags = response.tags;
          }
        } else {
          this.device = response;
        }
        this.device.hierarchyString = '';
        const keys = Object.keys(this.device.hierarchy);
        keys.forEach((key, index) => {
          this.device.hierarchyString += this.device.hierarchy[key] + ( keys[index + 1] ? ' / ' : '');
        });
        console.log(this.device);
        await this.getDeviceTypeDetail();
        this.getDeviceDetail();
      }
    );
  }

  getDeviceTypeDetail() {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.device.hierarchy),
        name: this.device.device_type,
        app: this.device.app
      };
      this.deviceTypeService.getThingsModelsList(obj).subscribe(
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
      );
    });
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
      display_name: this.device.display_name,
      tags: this.device.tags
    };
    let methodToCall;
    if (this.pageType === 'nonipdevices') {
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.contextApp.app);
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
      methodToCall = this.deviceService.updateNonIPDeviceTags(obj, this.contextApp.app);
    } else {
      methodToCall = this.deviceService.updateDeviceTags(obj, this.contextApp.app);
    }
    methodToCall.subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Tags');
        this.getDeviceData();

      }, error => this.toasterService.showError(error.message, 'Delete Tags')
    );
  }

}
