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
  contextApp: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.filterObj.gateway_id = this.device.device_id;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.devices = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICES_LIST);
    this.alertTableConfig = {
      type: 'cached alerts',
      DateRange: [],
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
    this.loadFromCache();
    this.filterObj.epoch = true;
  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
    }
    this.searchAlerts(this.filterObj, false);
  }

  searchAlerts(filterObj, updateFilterObj = true) {
    this.isFilterSelected = true;
    this.isAlertLoading = true;
    if (filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(filterObj.dateOption);
      filterObj.from_date = dateObj.from_date;
      filterObj.to_date = dateObj.to_date;
    } else {
      filterObj.from_date = filterObj.from_date;
      filterObj.to_date = filterObj.to_date;
    }
    const obj = {...filterObj};

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Alerts');
      this.isAlertLoading = false;
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
        if (this.filterObj.dateOption !== 'Custom Range') {
          this.alertTableConfig.DateRange = this.filterObj.dateOption;
        }
        else {
          this.alertTableConfig.DateRange = "this selected range";
        }
        //this.alertTableConfig.DateRange = this.filterObj.dateOption;
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
