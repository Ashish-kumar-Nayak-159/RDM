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
  isTagsEditable = false;
  constructor(
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.reservedTags = CONSTANTS.DEVICE_RESERVED_TAGS_LIST;
    this.getDeviceDetail();
  }

  getDeviceData() {
    this.deviceService.getDeviceData(this.device.device_id).subscribe(
      (response: any) => {
        this.device = response;
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
        this.device.tags.created_date = this.commonService.convertUTCDateToLocal(this.device.tags.created_date);
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
    this.deviceService.updateDeviceTags(obj).subscribe(
      response => {
        this.toasterService.showSuccess('Tags updated successfully', 'Set Tags');
        this.getDeviceData();
        this.isTagsEditable = false;
      }, error => this.toasterService.showError('Error in updating tags', 'Set Tags')
    );
  }

  deleteAllDeviceTags() {
    const tagObj = {};
    this.deviceCustomTags.forEach(tag => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = null;
      }
    });
    this.device.tags.custom_tags = tagObj;
    if (this.device.tags.created_date) {
      delete this.device.tags.created_date;
    }
    if (this.device.tags.created_by) {
      delete this.device.tags.created_by;
    }
    const obj = {
      device_id: this.device.device_id,
      tags: this.device.tags
    };
    this.deviceService.updateDeviceTags(obj).subscribe(
      response => {
        this.toasterService.showSuccess('Tags deleted successfully', 'Delete Tags');
        this.getDeviceData();

      }, error => this.toasterService.showError('Error in deleting tags', 'Delete Tags')
    );
  }

}
