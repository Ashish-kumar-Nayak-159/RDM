import { DeviceTypeService } from './../../../services/device-type/device-type.service';
import { CONSTANTS } from './../../../app.constants';
import { CommonService } from './../../../services/common.service';
import { DeviceService } from './../../../services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { ViewChild, AfterViewInit } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DaterangepickerComponent } from 'ng2-daterangepicker';

@Component({
  selector: 'app-device-count',
  templateUrl: './device-count.component.html',
  styleUrls: ['./device-count.component.css']
})
export class DeviceCountComponent implements OnInit, AfterViewInit {

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
  daterange: any;
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    timePicker: true,
    autoUpdateInput: false,
    maxDate: moment(),
    ranges: CONSTANTS.DATE_OPTIONS
  };
  selectedDateRange: any;
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  constructor(
    private toasterService: ToasterService,
    private deviceService: DeviceService,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService
  ) { }

  async ngOnInit(): Promise<void> {
    this.telemetryFilter = {};
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.telemetryFilter.app = this.contextApp.app;
    this.telemetryFilter.count = 10;
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
    this.telemetryFilter.aggregation_format = 'COUNT';
    this.telemetryFilter.aggregation_minutes = 1;

    this.telemetryFilter.count = 10;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = {...this.telemetryFilter};
    if (this.telemetryFilter.gateway_id) {
      this.getDevicesListByGateway();
    }

  }

  ngAfterViewInit() {
    this.loadFromCache();
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.telemetryFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.telemetryFilter.from_date = dateObj.from_date;
        this.telemetryFilter.to_date = dateObj.to_date;
      } else {
        this.telemetryFilter.from_date = item.from_date;
        this.telemetryFilter.to_date = item.to_date;
      }
      this.picker.datePicker.setStartDate(moment.unix(this.telemetryFilter.from_date));
      this.picker.datePicker.setEndDate(moment.unix(this.telemetryFilter.to_date));
      if (this.telemetryFilter.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.telemetryFilter.dateOption;
      } else {
        this.selectedDateRange = moment.unix(this.telemetryFilter.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
        moment.unix(this.telemetryFilter.to_date).format('DD-MM-YYYY HH:mm');
      }
    }
    // this.searchTelemetry(this.telemetryFilter, false);
  }

  getDevicesListByGateway() {
    this.devices = [];
    const obj = {
      gateway_id: this.telemetryFilter.gateway_id,
      type: 'Legacy Device'
    };
    this.apiSubscriptions.push(this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
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



  async searchTelemetry(filterObj, updateFilterObj = true) {
    this.telemetry = [];
    const obj = {...filterObj};
    delete obj.device;
    obj.device_id = filterObj?.device?.device_id;
    if (!obj.device_id) {
      this.toasterService.showError('Asset selection is required.', 'View Count Data');
    }
    await this.getThingsModelProperties(filterObj.device);
    if (this.telemetryTableConfig.data.length !== (this.propertyList.length + 1)) {
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
    }

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Telemetry Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
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
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      obj.partition_key = filterObj.device.partition_key;
    }
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
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.telemetryFilter.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.telemetryFilter.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  selectedDate(value: any, datepicker?: any) {
    this.telemetryFilter.from_date = moment(value.start).utc().unix();
    this.telemetryFilter.to_date = moment(value.end).utc().unix();
    this.telemetryFilter.dateOption = value.label;
    console.log(this.telemetryFilter);
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    if (this.telemetryFilter.to_date - this.telemetryFilter.from_date > 3600) {
      this.telemetryFilter.isTypeEditable = true;
    } else {
      this.telemetryFilter.isTypeEditable = false;
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
