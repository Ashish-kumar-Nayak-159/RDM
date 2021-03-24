import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from './../../../services/common.service';
import { DeviceService } from './../../../services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-device-count',
  templateUrl: './device-count.component.html',
  styleUrls: ['./device-count.component.css']
})
export class DeviceCountComponent implements OnInit {

  @Input() device: any;
  telemetryFilter: any;
  originalTelemetryFilter: any;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  today = new Date();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  isFilterSelected = false;
  telemetry: any[] = [];
  contextApp: any;
  propertyList: any[] = [];
  telemetryTableConfig: any;
  devices: any[] = [];
  constructor(
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.telemetryFilter = {};
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.telemetryFilter.gateway_id = this.device.device_id;
    } else {
      this.telemetryFilter.device_id = this.device.device_id;
    }
    this.telemetryTableConfig = {
      type: 'telemetry count',
      tableHeight: 'calc(100vh - 16rem)',
      headers: ['Timestamp'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_message_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        }
      ]
    };
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.telemetryFilter.aggregation_format = 'COUNT';
    this.telemetryFilter.aggregation_minutes = 1;

    this.telemetryFilter.count = 10;
    this.telemetryFilter.app = this.device?.tags?.app;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = {...this.telemetryFilter};
    if (this.telemetryFilter.gateway_id) {
      this.getDevicesListByGateway();
    }

  }

  getDevicesListByGateway() {
    this.devices = [];
    console.log(this.device);
    const obj = {
      gateway_id: this.telemetryFilter.gateway_id,
      app: this.device?.tags?.app
    };
    this.apiSubscriptions.push(this.deviceService.getNonIPDeviceList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
          if (this.devices.length === 1) {
            this.telemetryFilter.device = this.devices[0];
          }
          // this.devices.splice(0, 0, { device_id: this.telemetryFilter.gateway_id});
        }
      }, errror => {}
    ));
  }

  onDateOptionChange() {
    if (this.telemetryFilter.dateOption !== 'custom') {
      this.telemetryFilter.from_date = undefined;
      this.telemetryFilter.to_date = undefined;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.telemetryFilter.dateOption === '24 hour') {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
    }
  }

  getThingsModelProperties(device) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: device.device_type
      };
      this.apiSubscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => this.propertyList.push(prop));
          // this.props = [...this.dropdownPropList];
          resolve();
        }
      ));
    });
  }

  onSingleDateChange(event) {
    console.log(event);
    this.telemetryFilter.from_date = moment(event.value).utc();
    this.telemetryFilter.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.telemetryFilter.dateOption !== 'date') {
      this.telemetryFilter.dateOption = undefined;
    }
    const from = this.telemetryFilter.from_date.unix();
    const to = this.telemetryFilter.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.telemetryFilter.to_date = moment().utc();
    }
    if (to - from > 3600) {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
    }
  }

  onDateChange(event) {
    console.log(event);
    this.telemetryFilter.from_date = moment(event.value[0]).second(0).utc();
    this.telemetryFilter.to_date = moment(event.value[1]).second(0).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    console.log(this.telemetryFilter.dateOption);
    if (this.telemetryFilter.dateOption !== 'date range') {
      this.telemetryFilter.dateOption = undefined;
    }
    const from = this.telemetryFilter.from_date.unix();
    const to = this.telemetryFilter.to_date.unix();
    if (to - from > 3600) {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
    }
  }

  async searchTelemetry(filterObj) {
    console.log('filterObj ', filterObj);
    this.telemetry = [];
    const obj = {...filterObj};
    delete obj.device;
    obj.device_id = filterObj.device.device_id;
    if (!obj.device_id) {
      this.toasterService.showError('Device selection is required.', 'View Count Data');
    }
    await this.getThingsModelProperties(filterObj.device);
    this.propertyList.forEach(prop => {
      this.telemetryTableConfig.headers.push(prop.name);
      this.telemetryTableConfig.data.push({
        name: prop.name,
        key: prop.json_key,
        type: 'text',
        headerClass: '',
        valueclass: ''
      });
    });
    const now = moment().utc();
    if (filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    }else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Telemetry Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    delete obj.dateOption;
    delete obj.isTypeEditable;
    let method;
    if (!obj.aggregation_minutes || !obj.aggregation_format ) {
      this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
      return;
    }
    let message_props = '';
    this.propertyList.forEach((prop, index) => message_props = message_props + prop.json_key +
    (this.propertyList[index + 1] ? ',' : ''));
    obj['message_props'] = message_props;
    obj.partition_key = this.device?.tags?.partition_key;
    method = this.deviceService.getDeviceTelemetry(obj);
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;

    this.telemetryFilter = filterObj;
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetry = response.data;
          this.telemetry.forEach(item => {
            item.local_message_date = this.commonService.convertUTCDateToLocal(item.message_date);
          });

        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }

  onNumberChange(event, type) {
    console.log(event);
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.telemetryFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.telemetryFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  clear() {
    // this.filterSearch.emit(this.originalFilterObj);
    this.telemetryFilter = {};
    // this.isFilterSelected = false;
    this.telemetryFilter = {...this.originalTelemetryFilter};
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }
}
