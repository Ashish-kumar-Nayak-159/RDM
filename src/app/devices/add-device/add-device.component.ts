import { ApplicationService } from './../../services/application/application.service';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from './../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import * as moment from 'moment';
import { Device } from 'src/app/models/device.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
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
  @Output() cancelModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() deviceDetail: any;
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
  setupForm: FormGroup;
  protocolList = CONSTANTS.PROTOCOLS;
  isDeviceEditable = false;
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
    if (this.deviceDetail) {
      console.log(this.deviceDetail);
      this.isDeviceEditable = true;
      this.setupFormData(this.deviceDetail);
    } else {
    this.deviceDetail = new Device();
    if (!this.deviceDetail.metadata) {
    this.deviceDetail.metadata = {
      setup_details: {}
    };
    }
    this.deviceDetail.tags = {};
    this.deviceDetail.tags.app = this.contextApp.app;
    this.deviceDetail.tags.hierarchy_json = JSON.parse(JSON.stringify(this.contextApp.user.hierarchy));
    }
    $('#createDeviceModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  getThingsModels(type) {
    this.deviceTypes = [];
    const obj = {
      app: this.contextApp.app,
      model_type: type
    };
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
    this.setupFormData();
  }

  setupFormData(obj = undefined) {
    console.log(this.deviceDetail.tags.protocol);
    console.log(this.deviceDetail.tags.protocol === 'ModbusTCPMaster');
    console.log(this.deviceDetail.tags.protocol === 'ModbusRTUMaster');
    if (this.deviceDetail.tags.protocol === 'ModbusTCPMaster') {
      this.setupForm = new FormGroup({
        host_address: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.host_address !== undefined
            && obj.metadata.setup_details.host_address !== null) ? obj.metadata.setup_details.host_address : null, [Validators.required]),
        port_number: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.port_number !== undefined
            && obj.metadata.setup_details.port_number !== null) ? obj.metadata.setup_details.port_number : null, [Validators.required, Validators.min(0)]),
        slave_id: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.slave_id !== undefined
            && obj.metadata.setup_details.slave_id !== null) ? obj.metadata.setup_details.slave_id : null, [Validators.required]),
      });
    } else if (this.deviceDetail.tags.protocol === 'ModbusRTUMaster') {
      this.setupForm = new FormGroup({
        com_port: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.com_port !== undefined
            && obj.metadata.setup_details.com_port !== null) ? obj.metadata.setup_details.com_port : null, [Validators.required]),
        baud_rate: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.baud_rate !== undefined
            && obj.metadata.setup_details.baud_rate !== null) ? obj.metadata.setup_details.baud_rate : null, [Validators.required]),
        data_bits: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.data_bits !== undefined
            && obj.metadata.setup_details.data_bits !== null) ? obj.metadata.setup_details.data_bits : null,
          [Validators.required, Validators.min(5), Validators.max(9)]),
        slave_id: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.slave_id !== undefined
            && obj.metadata.setup_details.slave_id !== null) ? obj.metadata.setup_details.slave_id : null, [Validators.required]),
        parity: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.parity !== undefined
            && obj.metadata.setup_details.parity !== null) ? obj.metadata.setup_details.parity : null,
            [Validators.required, Validators.min(0), Validators.max(2)]),
        stop_bits: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.stop_bits !== undefined
            && obj.metadata.setup_details.stop_bits !== null) ? obj.metadata.setup_details.stop_bits : null,
            [Validators.required]),
      });
    } else  if (this.deviceDetail.tags.protocol === 'SiemensTCPIP') {
      this.setupForm = new FormGroup({
        host_address: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.host_address !== undefined
            && obj.metadata.setup_details.host_address !== null) ? obj.metadata.setup_details.host_address : null,
          [Validators.required]),
        rack: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.rack !== undefined
            && obj.metadata.setup_details.rack !== null) ? obj.metadata.setup_details.rack : null,
          [Validators.required, Validators.min(0), Validators.max(7)]),
        slot: new FormControl(
          (obj && obj.metadata && obj.metadata.setup_details && obj.metadata.setup_details.slot !== undefined
            && obj.metadata.setup_details.slot !== null) ? obj.metadata.setup_details.slot : null,
          [Validators.required, Validators.min(0), Validators.max(31)]),
      });
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

  onEditDevice() {
    this.isCreateDeviceAPILoading = true;
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
      this.deviceDetail.metadata.setup_details = this.setupForm.value;
      }
    const obj = {
      app : this.contextApp.app,
      metadata: this.deviceDetail.metadata
    };
    this.subscriptions.push(this.deviceService.updateDeviceMetadata(obj, this.contextApp.app, this.deviceDetail.device_id).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Update Asset Settings');
        this.getDeviceEmit.emit();
        this.onCloseCreateDeviceModal();
        this.isCreateDeviceAPILoading = false;
      }, error => {
        this.toasterService.showError(error.message, 'Update Asset Settings');
        this.isCreateDeviceAPILoading = false;
      }
    ));
  }

  onCreateDevice() {
    if (!this.deviceDetail.device_id || !this.deviceDetail.tags.device_manager ||
      !this.deviceDetail.tags.protocol || !this.deviceDetail.tags.cloud_connectivity  ) {
        this.toasterService.showError('Please fill all the details',
        'Create ' + this.componentState);
        return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && !this.deviceDetail.gateway_id) {
      this.toasterService.showError('Gateway Selection is compulsory.',
        'Create ' + this.componentState);
      return;
    }
    if (!CONSTANTS.EMAIL_REGEX.test(this.deviceDetail.tags.device_manager.user_email)) {
      this.toasterService.showError('Email address is not valid',
        'Create ' + this.componentState);
      return;
    }
    if (this.componentState === CONSTANTS.NON_IP_DEVICE && this.deviceDetail.device_id === this.deviceDetail.gateway_id) {
      this.toasterService.showError('Gateway and Asset name can not be the same.',
      'Create ' + this.componentState);
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy !== 'Device ID' &&
    !CONSTANTS.ONLY_NOS_AND_CHARS.test(this.deviceDetail.tags.partition_key)) {
      this.toasterService.showError('Partition Key only contains numbers and characters.',
      'Create ' + (this.tileData  ? this.tileData.table_key : ''));
      return;
    }
    if (this.contextApp.metadata?.partition?.telemetry?.partition_strategy === 'Device ID') {
      this.deviceDetail.tags.partition_key = this.deviceDetail.device_id;
    }

    this.isCreateDeviceAPILoading = true;
    this.deviceDetail.tags.hierarchy_json = { App: this.contextApp.app};
    Object.keys(this.addDeviceConfigureHierarchy).forEach((key) => {
      this.deviceDetail.tags.hierarchy_json[this.contextApp.hierarchy.levels[key]] = this.addDeviceConfigureHierarchy[key];
    });
    const modelObj = this.deviceTypes.filter(type => type.name === this.deviceDetail.tags.device_type)[0];
    if (!this.deviceDetail.metadata) {
      this.deviceDetail.metadata = {};
    }
    this.deviceDetail.metadata.telemetry_mode_settings = {
      normal_mode_frequency: modelObj?.telemetry_mode_settings?.normal_mode_frequency || 60,
      turbo_mode_frequency: modelObj?.telemetry_mode_settings?.turbo_mode_frequency || 5,
      turbo_mode_timeout_time: modelObj?.telemetry_mode_settings?.turbo_mode_timeout_time || 120
    };
    this.deviceDetail.metadata.data_ingestion_settings = {
      type: modelObj?.data_ingestion_settings.type || 'all_props_at_fixed_interval',
      frequency_in_sec: modelObj?.data_ingestion_settings.frequency_in_sec || 10
    };
    this.deviceDetail.metadata.measurement_settings = {
      measurement_frequency: modelObj?.measurement_settings?.measurement_frequency || 5
    };
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
    this.deviceDetail.metadata.setup_details = this.setupForm.value;
    }
    const protocol = this.protocolList.find(protocolObj => protocolObj.name === this.deviceDetail.tags.protocol);
    this.deviceDetail.metadata.package_app = protocol.metadata?.app;
    this.deviceDetail.tags.hierarchy = JSON.stringify(this.deviceDetail.tags.hierarchy_json );
    this.deviceDetail.tags.created_by = this.userData.email + ' (' + this.userData.name + ')';
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
    const obj = JSON.parse(JSON.stringify(this.deviceDetail));
    obj.tags.device_manager = this.deviceDetail.tags.device_manager.user_email;
    obj.tags.email_recipients = obj.tags.device_manager;
    const methodToCall = this.componentState === CONSTANTS.NON_IP_DEVICE
    ? this.deviceService.createNonIPDevice(obj, this.contextApp.app)
    : this.deviceService.createDevice(obj, this.contextApp.app);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if ( this.componentState === CONSTANTS.NON_IP_DEVICE) {
          this.updateGatewayTags(this.deviceDetail);
        } else {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showSuccess(response.message,
          'Create ' + (this.tileData  ? this.tileData.table_key : ''));
        this.getDeviceEmit.emit();
        this.onCloseCreateDeviceModal();
      }
      }, error => {
        this.isCreateDeviceAPILoading = false;
        this.toasterService.showError(error.message,
          'Create ' + (this.tileData  ? this.tileData.table_key : ''));
        // this.onCloseCreateDeviceModal();
      }
    ));
  }

  updateGatewayTags(deviceObj) {
    const obj = {
      device_id: deviceObj.device_id,
      partition_key: deviceObj.tags.partition_key,
      model_id: deviceObj.tags.device_type
    };
    // obj.partition_key[deviceObj.device_id] = deviceObj.tags.partition_key;
    this.subscriptions.push(this.deviceService.attachLegacyDeviceToGateway(this.contextApp.app, deviceObj.gateway_id, obj).subscribe(
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
    this.cancelModal.emit();
    this.deviceDetail = undefined;
  }

}
