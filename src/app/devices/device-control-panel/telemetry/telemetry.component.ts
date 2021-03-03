import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-telemetry',
  templateUrl: './telemetry.component.html',
  styleUrls: ['./telemetry.component.css']
})
export class TelemetryComponent implements OnInit, OnDestroy {

  telemetryFilter: any = {};
  telemetry: any[] = [];
  @Input() device: Device = new Device();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  modalConfig: any;
  telemetryTableConfig: any = {};
  pageType: string;
  devices: any[] = [];
  originalTelemetryFilter: any;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  today = new Date();
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.telemetryFilter.gateway_id = this.device.device_id;
    } else {
      this.telemetryFilter.device_id = this.device.device_id;
    }
    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.telemetryTableConfig = {
        type: 'process parameter',
        tableHeight: 'calc(100vh - 16rem)',
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
      if (this.pageType === 'gateway') {
        this.telemetryTableConfig.data.splice(1, 1);
        this.telemetryTableConfig.data.splice(1, 0, {
          name: 'Asset Name',
          key: 'device_id'
        });
      }
    });

    if (this.telemetryFilter.gateway_id) {
      this.getDevicesListByGateway();
    }
    // this.telemetryFilter.type = true;
    this.telemetryFilter.sampling_format = 'minute';
    this.telemetryFilter.sampling_time = 1;

    this.telemetryFilter.count = 10;
    this.telemetryFilter.app = this.device?.tags?.app;
    this.telemetryFilter.epoch = true;
    this.originalTelemetryFilter = {...this.telemetryFilter};

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
          this.devices.splice(0, 0, { device_id: this.telemetryFilter.gateway_id});
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

  onSingleDateChange(event) {
    console.log(event);
    this.telemetryFilter.from_date = moment(event.value).utc();
    this.telemetryFilter.to_date = moment().utc();
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.telemetryFilter.dateOption !== 'date') {
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

  searchTelemetry(filterObj) {
    console.log('filterObj ', filterObj);
    this.telemetry = [];
    const obj = {...filterObj};
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
    if (obj.to_date - obj.from_date > 3600 && !this.telemetryFilter.isTypeEditable) {
        this.toasterService.showError('Please select sampling filters.', 'View Telemetry');
        return;
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
        epoch: true
      };
      const epoch =  this.commonService.convertDateToEpoch(dataobj.message_date);
      obj.from_date = epoch ? (epoch - 5) : null;
      obj.to_date = (epoch ? (epoch + 5) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'telemetry').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
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
