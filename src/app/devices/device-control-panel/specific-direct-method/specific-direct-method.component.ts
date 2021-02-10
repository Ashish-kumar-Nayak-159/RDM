import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import * as moment from 'moment';
import { DeviceService } from 'src/app/services/devices/device.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-specific-direct-method',
  templateUrl: './specific-direct-method.component.html',
  styleUrls: ['./specific-direct-method.component.css']
})
export class SpecificDirectMethodComponent implements OnInit {

  @Input() pageType: any;
  @Input() device: Device = new Device();
  userData: any;
  displayType: string;
  listName: string;
  appName: string;
  apiSubscriptions: Subscription[] = [];
  controlWidgets: any[] = [];
  selectedWidget: any;
  jsonModelKeys = [];
  isInvokeDirectMethod: boolean;
  responseMessage: any;
  constructor(

    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceTypeService: DeviceTypeService,
    private deviceService: DeviceService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.displayType = 'compose';
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.listName = params.get('listName');
      this.listName = this.listName.slice(0, -1);
      if (this.pageType.includes('control')) {
        this.getControlWidgets();
      } else {
        this.getConfigureWidgets();
      }
    });
  }

  getControlWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelControlWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

  onWidgetSelection() {
    this.jsonModelKeys = [];
    if (this.selectedWidget) {
      this.selectedWidget.response_timeout_in_sec = 20;
      this.selectedWidget.connection_timeout_in_sec = 20;
      const keys = Object.keys(this.selectedWidget.json);
      const index = keys.findIndex(key => key.toLowerCase() === 'timestamp');
      if (index > -1) {
        keys.splice(index, 1);
      }
      this.selectedWidget.method_name = keys[0];
      this.selectedWidget.json[keys[0]].params.forEach(obj => {
        obj.name = obj.key;
        obj.value = obj.json.defaultValue;
        this.jsonModelKeys.splice(this.jsonModelKeys.length, 0, obj);
      });
    }
  }

  getConfigureWidgets() {
    const obj = {
      app: this.appName,
      device_type: this.device.tags?.device_type
    };
    this.apiSubscriptions.push(this.deviceTypeService.getThingsModelConfigurationWidgets(obj).subscribe(
      (response: any) => {
        if (response?.data) {
          this.controlWidgets = response.data.filter(widget => widget.metadata.communication_technique === 'Direct Method');
        }
      }
    ));
  }

  invokeDirectMethod() {
    this.responseMessage = undefined;
    const timestamp = moment().unix();
    const obj: any = {};
    obj.method = this.selectedWidget.method_name;
    obj.app = this.device.app;
    obj.message_id = this.device.device_id + '_' + timestamp;
    if (this.listName === 'gateway') {
      obj.gateway_id = this.device.device_id;
    } else {
      obj.device_id = this.device.device_id;
      obj.gateway_id = this.device.gateway_id;
    }
    obj.response_timeout_in_sec = this.selectedWidget.response_timeout_in_sec;
    obj.connection_timeout_in_sec = this.selectedWidget.connection_timeout_in_sec;
    obj.message = {};
    this.jsonModelKeys.forEach(item => {
      if (item.value !== null || item.value !== undefined) {
        if (item.json.type === 'boolean') {
          obj.message[item.key] = item.value ? item.json.trueValue : item.json.falseValue;
        } else {
          obj.message[item.key] = item.value;
        }
      }
    });
    obj.message['timestamp'] = timestamp;
    this.isInvokeDirectMethod = true;
    this.apiSubscriptions.push(this.deviceService.callDeviceMethod(obj, obj.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Invoke Direct Method');
        this.isInvokeDirectMethod = false;
        this.responseMessage = response;
      }, error => {
        this.toasterService.showError(error.message, 'Invoke Direct Method');
        this.isInvokeDirectMethod = false;
        this.responseMessage = error;
      }
    ));
  }

}
