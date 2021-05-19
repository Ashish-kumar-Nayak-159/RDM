import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-rdmdevice-control-panel-error',
  templateUrl: './rdmdevice-control-panel-error.component.html',
  styleUrls: ['./rdmdevice-control-panel-error.component.css']
})
export class RDMDeviceControlPanelErrorComponent implements OnInit, OnDestroy {

  errorFilter: any = {};
  errors: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  isErrorLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedError: any;
  isFilterSelected = false;
  modalConfig: any;
  errorTableConfig: any = {};
  pageType: string;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.device?.tags?.category === CONSTANTS.IP_GATEWAY) {
      this.errorFilter.gateway_id = this.device.device_id;
    } else {
      this.errorFilter.device_id = this.device.device_id;
    }
    this.errorTableConfig = {
      type: 'error',
      headers: ['Timestamp', 'Message ID', 'Error Code', 'Message'],
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message ID',
          key: 'message_id',
        },
        {
          name: 'Error Code',
          key: 'error_code',
        },
        {
          name: 'Message',
          key: undefined,
        }
      ]
    };
    this.errorFilter.epoch = true;

  }

  searchError(filterObj) {
    this.isFilterSelected = true;
    this.isErrorLoading = true;
    const obj = {...filterObj};
    this.errorFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceError(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.errors = response.data;
          this.errors.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));

        }
        this.isErrorLoading = false;
      }, error => this.isErrorLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id
      };
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'error').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openErrorMessageModal(obj) {
    if (obj.type === this.errorTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedError = obj.data;
    this.getMessageData(obj.data).then(message => {
      this.selectedError.message = message;
    });
    $('#errorMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#errorMessageModal').modal('hide');
      this.selectedError = undefined;
    }
  }


  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
