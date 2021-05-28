import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;
@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.css']
})
export class TelemetryComponent implements OnInit, OnDestroy, AfterViewInit {

  telemetryFilter: any = {};
  telemetry: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  modalConfig: any;
  telemetryTableConfig: any = {};
  pageType: string;
  devices: any[] = [];
  originalTelemetryFilter: any;
  daterange: any;
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS
  };
  today = new Date();
  contextApp: any;
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.telemetryFilter.gateway_id = this.device.device_id;
    } else {
      this.telemetryFilter.device_id = this.device.device_id;
    }
    this.telemetryTableConfig = {
      type: 'process parameter',
      tableHeight: 'calc(100vh - 13.5rem)',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_message_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        },
        // {
        //   name: 'Message ID',
        //   key: 'message_id',
        // },
        {
          name: 'IOT Hub Date',
          key: 'local_iothub_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        },
        {
          name: 'Database Record Date',
          key: 'local_created_date',
          type: 'text',
          headerClass: 'w-15',
          valueclass: ''
        },
        {
          name: 'Message',
          key: undefined,
          type: 'button',
          btnData: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View Process Parameter Message',
              valueclass: '',
              tooltip: 'View Process Parameter Message'
            }
          ]
        }
      ]
    };

    if (this.telemetryFilter.gateway_id) {
      this.getDevicesListByGateway();
    }
    // this.telemetryFilter.type = true;
    this.telemetryFilter.sampling_format = 'minute';
    this.telemetryFilter.sampling_time = 1;

    this.telemetryFilter.count = 10;
    this.telemetryFilter.app = this.contextApp.app;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = {...this.telemetryFilter};
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
      if (this.telemetryFilter.to_date - this.telemetryFilter.from_date > 3600) {
        this.telemetryFilter.isTypeEditable = true;
      } else {
        this.telemetryFilter.isTypeEditable = false;
      }
    }
    this.searchTelemetry(this.telemetryFilter, false);
  }

  getDevicesListByGateway() {
    this.devices = [];
    const obj = {
      gateway_id: this.telemetryFilter.gateway_id,
      app: this.device?.tags?.app
    };
    this.apiSubscriptions.push(this.deviceService.getNonIPDeviceList(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
          this.devices.splice(0, 0, { device_id: this.telemetryFilter.gateway_id});
        }
      }, errror => {}
    ));
  }

  selectedDate(value: any, datepicker?: any) {
    // this.telemetryFilter.from_date = moment(value.start).utc().unix();
    // this.telemetryFilter.to_date = moment(value.end).utc().unix();
    this.telemetryFilter.dateOption = value.label;
    if (this.telemetryFilter.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.telemetryFilter.dateOption);
      this.telemetryFilter.from_date = dateObj.from_date;
      this.telemetryFilter.to_date = dateObj.to_date;
    } else {
      this.telemetryFilter.from_date = moment(value.start).utc().unix();
      this.telemetryFilter.to_date = moment(value.end).utc().unix();
    }
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
    // this.datepicker.datePicker.setStartDate(null);
    // this.datepicker.datePicker.setEndDate(null);
    this.telemetryFilter = {};
    this.telemetryFilter = {...this.originalTelemetryFilter};
    console.log(this.telemetryFilter);
  }

  searchTelemetry(filterObj, updateFilterObj = true) {
    this.telemetry = [];
    const obj = {...filterObj};
    obj.partition_key = this.device?.tags?.partition_key;
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Telemetry Data');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    obj.app = this.contextApp.app;
    console.log(obj);
    delete obj.isTypeEditable;
    let method;
    if (obj.to_date - obj.from_date > 3600 && !this.telemetryFilter.isTypeEditable) {
        this.toasterService.showError('Please select sampling filters.', 'View Telemetry');
        return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
    }
    if (this.telemetryFilter.isTypeEditable) {

      if (!this.telemetryFilter.sampling_time || !this.telemetryFilter.sampling_format ) {
        this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
        return;
      } else {
        method = this.deviceService.getDeviceSamplingTelemetry(obj, this.device?.tags?.app);
      }

    } else {
      delete obj.sampling_time;
      delete obj.sampling_format;
      method = this.deviceService.getDeviceTelemetry(obj);
    }
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;

    this.telemetryFilter = filterObj;
    this.apiSubscriptions.push(method.subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetry = response.data;
          this.telemetry.forEach(item => {
            item.local_message_date = this.commonService.convertUTCDateToLocal(item.message_date);
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
            item.local_iothub_date = this.commonService.convertUTCDateToLocal(item.iothub_date);
          });

        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        device_id: this.device.device_id,
        from_date: null,
        to_date: null,
        epoch: true,
        partition_key: this.device?.tags?.partition_key
      };
      const epoch =  this.commonService.convertDateToEpoch(dataobj.message_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'telemetry').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
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

  openTelemetryMessageModal(obj) {
    if (obj.type === this.telemetryTableConfig.type) {
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.selectedTelemetry = obj.data;
      this.getMessageData(obj.data).then(message => {
        this.selectedTelemetry.message = message;
      });
      $('#telemetryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#telemetryMessageModal').modal('hide');
      this.selectedTelemetry = undefined;
    }
  }


  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
