import { ApplicationService } from './../../services/application/application.service';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { Device } from 'src/app/models/device.model';
declare var $: any;
@Component({
  selector: 'app-add-device',
  templateUrl: './add-device.component.html',
  styleUrls: ['./add-device.component.css']
})
export class AddDeviceComponent implements OnInit {

  @Input() tileData: any;
  @Input() componentState: any;
  @Output() getDeviceEmit: EventEmitter<any> = new EventEmitter<any>();
  deviceDetail: any;
  isCreateDeviceAPILoading = false;
  contextApp: any;
  addDeviceConfigureHierarchy = {};
  addDeviceHierarchyArr: any[] = [];
  constantData = CONSTANTS;
  appUsers: any[] = [];
  @Input() gateways: any[] = [];
  deviceTypes: any[] = [];
  userData: any;
  subscriptions: any[] = [];
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.getApplicationUsers();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.addDeviceHierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.addDeviceConfigureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfAddDeviceHierarchy(index);

      }
      }
    });
    this.getThingsModels(this.componentState);
    this.deviceDetail = new Device();
    this.deviceDetail.tags = {};
    this.deviceDetail.tags.app = this.contextApp.app;
    this.deviceDetail.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getThingsModels(type) {
    this.deviceTypes = [];
    const obj = {
      app: this.contextApp.app,
      model_type: type
    };
    console.log(obj);
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.deviceTypes = response.data;
        }
      }
    ));
  }

  onChangeOfAddDeviceHierarchy(i) {
    Object.keys(this.addDeviceConfigureHierarchy).forEach(key => {
      if (key > i) {
        delete this.addDeviceConfigureHierarchy[key];
      }
    });
    Object.keys(this.addDeviceHierarchyArr).forEach(key => {
      if (key > i) {
        this.addDeviceHierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.addDeviceConfigureHierarchy).forEach((key, index) => {
      if (this.addDeviceConfigureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.addDeviceConfigureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.addDeviceHierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
  }

  onChangeThingsModel() {
    if (this.deviceDetail.tags.device_type) {
      const modelObj = this.deviceTypes.filter(type => type.name === this.deviceDetail.tags.device_type)[0];
      modelObj.tags = {
        cloud_connectivity: modelObj.cloud_connectivity,
        protocol: modelObj.protocol
      };
      const obj = {...this.deviceDetail.tags, ...modelObj.tags};
      this.deviceDetail.tags = obj;
    }
  }

  getApplicationUsers() {
    this.appUsers = [];
    this.subscriptions.push(this.applicationService.getApplicationUsers(this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.appUsers = response.data;
        }
      }
    ));
  }

  onCreateDevice() {
    console.log(this.deviceDetail);
    if (!this.deviceDetail.device_id || !this.deviceDetail.gateway_id || !this.deviceDetail.tags.device_manager ||
      !this.deviceDetail.tags.protocol || !this.deviceDetail.tags.cloud_connectivity  ) {
        this.toasterService.showError('Please fill all the details',
        'Create ' + this.componentState);
        return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.deviceDetail.tags.device_manager.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Create ' + this.componentState);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && this.deviceDetail.device_id === this.deviceDetail.gateway_id) {
      this.toasterService.showError('Gateway and Device name can not be the same.',
      'Create ' + this.componentState);
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy !== 'Device ID' &&
    !CONSTANTS.ONLY_NOS_AND_CHARS.test(this.deviceDetail.tags.partition_key)) {
      this.toasterService.showError('Partition Key only contains numbers and characters.',
      'Create Device');
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'Device ID') {
      this.deviceDetail.tags.partition_key = this.deviceDetail.device_id;
    }
    this.isCreateDeviceAPILoading = true;
    console.log(this.deviceDetail);
    this.deviceDetail.tags.hierarchy_json = { App: this.contextApp.app};
    Object.keys(this.addDeviceConfigureHierarchy).forEach((key) => {
      this.deviceDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] = this.addDeviceConfigureHierarchy[key];
      console.log(this.deviceDetail.tags.hierarchy_json);
    });
    this.deviceDetail.tags.hierarchy = JSON.stringify(this.deviceDetail.tags.hierarchy_json );
    this.deviceDetail.tags.created_by = this.userData.email;
    this.deviceDetail.app = this.contextApp.app;
    delete this.deviceDetail.tags.reserved_tags;
    this.deviceDetail.tags.category = this.componentState === CONSTANTS.NON_IP_DEVICE ?
    null : this.componentState;
    this.deviceDetail.tags.created_date = moment().utc().format('M/DD/YYYY h:mm:ss A');
    this.deviceDetail.tags.device_users = {};
    this.deviceDetail.tags.device_users[btoa(this.deviceDetail.tags.device_manager.user_email)] = {
      user_email: this.deviceDetail.tags.device_manager.user_email,
      user_name: this.deviceDetail.tags.device_manager.user_name
    };
    this.deviceDetail.tags.device_manager = this.deviceDetail.tags.device_manager.user_email;
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.createNonIPDevice(this.deviceDetail, this.contextApp.app)
    : this.deviceService.createDevice(this.deviceDetail, this.contextApp.app);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if ( this.componentState === CONSTANTS.NON_IP_DEVICE) {
          this.updateGatewayTags(this.deviceDetail);
        } else {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + this.componentState);
        this.getDeviceEmit.emit();
        this.onCloseCreateDeviceModal();
      }
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + this.componentState);
        // this.onCloseCreateDeviceModal();
      }
    ));
  }

  updateGatewayTags(deviceObj) {
    const obj = {
      device_id: deviceObj.gateway_id,
      tags: {
        partition_keys: {
        }
      }
    };
    obj.tags.partition_keys[deviceObj.device_id] = deviceObj.tags.partition_key;
    this.subscriptions.push(this.deviceService.updateDeviceTags(obj, this.contextApp.app).subscribe(
      (response: any) => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + this.componentState);
        this.getDeviceEmit.emit();
        this.onCloseCreateDeviceModal();
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + this.componentState);
        // this.onCloseCreateDeviceModal();
      }
    ));
  }

  onCloseCreateDeviceModal() {
    $('#createDeviceModal').modal('hide');
    this.deviceDetail = undefined;
  }

}
