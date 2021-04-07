import { ToasterService } from './../../../services/toaster.service';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
declare var $: any;
@Component({
  selector: 'app-gateway-cached-alerts',
  templateUrl: './gateway-cached-alerts.component.html',
  styleUrls: ['./gateway-cached-alerts.component.css']
})
export class GatewayCachedAlertsComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  alertsList: any[] = [];
  @Input() device: Device = new Device();
  isAlertLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedAlert: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  alertTableConfig: any = {};
  devices: any[] = [];
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {

    this.filterObj.gateway_id = this.device.device_id;
    this.devices = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICES_LIST);
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.alertTableConfig = {
        type: 'cached alerts',
        headers: ['Timestamp', 'Asset Name', 'File Name', 'Process Status', 'View'],
        data: [
          {
            name: 'Uploaded At',
            key: 'local_upload_date',
          },
          {
            name: 'Processed At',
            key: 'local_created_date',
          },
          {
            name: 'Asset Name',
            key: 'display_name',
          },
          {
            name: '',
            key: undefined,
          }
        ],
        rowHighlight: {
          param: 'process_status',
          value: 'Success'
        }
      };

    }));
    this.filterObj.epoch = true;
  }

  searchAlerts(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isAlertLoading = true;
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
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Alerts');
      this.isAlertLoading = false;
      this.isFilterSelected = false;
      return;
    }
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.apiSubscriptions.push(this.deviceService.getGatewayCachedAlerts(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.alertsList = response.data;
          this.alertsList.forEach(item => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
            item.local_upload_date = this.commonService.convertUTCDateToLocal(item.iothub_date);
            if (this.devices?.length > 0 && item.device) {
              const deviceObj = this.devices.find(device => device.device_id === item.device_id)
              item.display_name = deviceObj?.display_name || item.device_id;
            } else {
              item.display_name = item.device_id;
            }
          });
        }
        this.isAlertLoading = false;
      }, error => this.isAlertLoading = false
    ));
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  this.commonService.convertDateToEpoch(dataobj.created_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'cached_alert').subscribe(
        (response: any) => {
          resolve(response.raw_data);
        }
      ));
    });
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
      this.selectedAlert = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.getMessageData(obj.data).then(message => {
        this.selectedAlert.message = message;
      });
      $('#alertMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#alertMessageModal').modal('hide');
      this.selectedAlert = undefined;
    }
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }


}
