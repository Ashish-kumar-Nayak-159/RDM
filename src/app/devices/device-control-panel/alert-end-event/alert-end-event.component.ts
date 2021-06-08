import { ToasterService } from './../../../services/toaster.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;

@Component({
  selector: 'app-alert-end-event',
  templateUrl: './alert-end-event.component.html',
  styleUrls: ['./alert-end-event.component.css']
})
export class AlertEndEventComponent implements OnInit, OnDestroy {

  alertFilter: any = {};
  alerts: any[] = [];
  @Input() device: Device = new Device();
  @Input() componentState: any;
  isAlertLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedAlert: any;
  isFilterSelected = false;
  modalConfig: any;
  alertTableConfig: any = {};
  pageType: string;
  contextApp: any;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.device.tags.category === CONSTANTS.IP_GATEWAY) {
      this.alertFilter.gateway_id = this.device.device_id;
    } else {
      this.alertFilter.device_id = this.device.device_id;
    }
    this.alertFilter.count = 10;
    this.alertFilter.app = this.contextApp.app;
    this.alertTableConfig = {
      type: 'alert',
      headers: ['Timestamp', 'Message ID', 'Message'],
      data: [
        {
          name: 'Code',
          key: 'code',
        },
        {
          name: 'Timestamp',
          key: 'local_created_date',
        },
        {
          name: 'Message',
          key: 'message'
        },
        {
          name: '',
          key: undefined,
        }
      ]
    };
    if (this.componentState === CONSTANTS.IP_GATEWAY) {
      // this.alertTableConfig.data.splice(1, 1);
      this.alertTableConfig.data.splice(2, 0, {
        name: 'Asset Name',
        key: 'device_id'
      });
    }
    this.loadFromCache();
    this.alertFilter.epoch = true;

  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    if (item.dateOption) {
      this.alertFilter.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.alertFilter.from_date = dateObj.from_date;
        this.alertFilter.to_date = dateObj.to_date;
      } else {
        this.alertFilter.from_date = item.from_date;
        this.alertFilter.to_date = item.to_date;
      }
    }
    this.searchAlerts(this.alertFilter, false);
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
      this.toasterService.showError('Date selection is requierd.', 'Get Alert End Events');
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
    this.alertFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceAlertEndEvents(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.alerts = response.data;
          this.alerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        }
        this.isAlertLoading = false;
      }, error => this.isAlertLoading = false
    ));
  }

  getAlertMessageData(alert) {
    return new Promise((resolve) => {
      const obj = {
        app: alert.app,
        id: alert.id,
        device_id: this.device.device_id,
        from_date: null,
        to_date: null,
        epoch: true
      };
      const epoch =  this.commonService.convertDateToEpoch(alert.message_date);
      obj.from_date = epoch ? (epoch - 300) : null;
      obj.to_date = (epoch ? (epoch + 300) : null);
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'alertendevent').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
    this.modalConfig = {
      jsonDisplay: true,
      isDisplaySave: false,
      isDisplayCancel: true
    };
    this.selectedAlert = JSON.parse(JSON.stringify(obj.data));
    this.getAlertMessageData(obj.data).then(message => {
      this.selectedAlert.message = message;
    });
    // this.selectedAlert = obj.data;
    $('#alertEndEventMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#alertEndEventMessageModal').modal('hide');
      this.selectedAlert = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
