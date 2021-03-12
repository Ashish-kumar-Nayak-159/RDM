import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DeviceService } from './../../services/devices/device.service';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-alerts',
  templateUrl: './application-alerts.component.html',
  styleUrls: ['./application-alerts.component.css']
})
export class ApplicationAlertsComponent implements OnInit, OnDestroy {

  contextApp: any;
  filterObj: any = {};
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  apiSubscriptions: Subscription[] = [];
  devices: any[] = [];
  originalDevices: any[] = [];
  isAlertLoading = false;
  alerts: any[] = [];
  alertTableConfig: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  isFilterSelected = false;
  modalConfig: { jsonDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean; };
  selectedAlert: any;
  today = new Date();
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);

    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app
        },
          {
            title: 'Alerts',
            url: 'applications/' + this.contextApp.app + '/alerts'
          }
      ]
    });
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.epoch = true;
    this.alertTableConfig = {
      type: 'alert',
      data: [
        {
          name: 'Code',
          key: 'code',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Timestamp',
          key: 'local_created_date',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Device',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: 'Message',
          key: 'message',
          type: 'text',
          headerClass: '',
          valueclass: ''
        },
        {
          name: '',
          key: undefined,
          type: 'button',
            headerClass: '',
            btnData: [
              {
                icon: 'fa fa-fw fa-eye',
                text: '',
                id: 'View',
                valueclass: '',
                tooltip: 'View'
              }
            ]
        }
      ]
    };
    await this.getAllDevices();
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }


    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
      this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
      if (this.contextApp.user.hierarchy[level]) {
        this.onChangeOfHierarchy(index, false);
      }
      }
    });
  }

  async onChangeOfHierarchy(i, flag = true) {
    Object.keys(this.configureHierarchy).forEach(key => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach(key => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};

    if (flag) {
      const hierarchyObj: any = { App: this.contextApp.app};
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
        console.log(hierarchyObj);
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.devices = JSON.parse(JSON.stringify(this.originalDevices));
      } else {
      const arr = [];
      this.devices = [];
      console.log(this.originalDevices);
      this.originalDevices.forEach(device => {
        let flag1 = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag1 = true;
          } else {
            flag1 = false;
          }
        });
        if (flag1) {
          arr.push(device);
        }
      });
      console.log('devicessss  ', arr);
      this.devices = JSON.parse(JSON.stringify(arr));
      }
      if (this.devices?.length === 1) {
        this.filterObj.device = this.devices[0];
      }
      // await this.getDevices(hierarchyObj);
    }
    let count = 0;
    Object.keys(this.configureHierarchy).forEach(key => {
      if (this.configureHierarchy[key]) {
        count ++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }

  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.device_id === c2.device_id : c1 === c2;
  }

  getAllDevices() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
      };
      this.apiSubscriptions.push(this.deviceService.getAllGatewaysAndDevicesList(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
          }
          resolve();
        }
      ));
    });
  }

  onDateOptionChange() {
    if (this.filterObj.dateOption !== 'custom') {
      this.filterObj.from_date = undefined;
      this.filterObj.to_date = undefined;
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
  }

  onDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
  }

  onSingleDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
  }

  searchAlerts() {
    this.isFilterSelected = true;
    this.isAlertLoading = true;
    const obj = {...this.filterObj};
    const now = moment().utc();
    if (this.filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (this.filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (this.filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (this.filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (this.filterObj.from_date) {
        obj.from_date = (this.filterObj.from_date.unix());
      }
      if (this.filterObj.to_date) {
        obj.to_date = this.filterObj.to_date.unix();
      }
    }
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
      console.log(obj.hierarchy);
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    obj.device_id = obj.device?.device_id;
    delete obj.device;
    delete obj.dateOption;
    this.apiSubscriptions.push(this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.alerts = response.data;
          this.alerts.forEach(item => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
            const name = this.originalDevices.filter(device => device.device_id === item.device_id)[0].display_name;
            item.display_name = name ? name : item.device_id;
          });
        }
        this.isAlertLoading = false;
      }, error => this.isAlertLoading = false
    ));
  }

  openAlertMessageModal(obj) {
    if (obj.type === this.alertTableConfig.type) {
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      this.selectedAlert = JSON.parse(JSON.stringify(obj.data));
      this.getMessageData(obj.data).then(message => {
        this.selectedAlert.message = message;
      });
      $('#alertMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
      }
  }

  getMessageData(alert) {
    return new Promise((resolve) => {
      const obj = {
        app: alert.app,
        id: alert.id
      };
      this.apiSubscriptions.push(this.deviceService.getDeviceMessageById(obj, 'alert').subscribe(
        (response: any) => {
          resolve(response.message);
        }
      ));
    });
  }

  clear() {
    this.filterObj = {};
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.epoch = true;
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
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
