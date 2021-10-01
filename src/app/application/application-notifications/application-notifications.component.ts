import { ToasterService } from './../../services/toaster.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AssetService } from './../../services/assets/asset.service';
import { CommonService } from './../../services/common.service';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { CONSTANTS } from 'src/app/app.constants';

declare var $: any;
@Component({
  selector: 'app-application-notifications',
  templateUrl: './application-notifications.component.html',
  styleUrls: ['./application-notifications.component.css'],
})
export class ApplicationNotificationsComponent implements OnInit, OnDestroy {
  contextApp: any;
  filterObj: any = {};
  @ViewChild('dtInput1', { static: false }) dtInput1: any;
  @ViewChild('dtInput2', { static: false }) dtInput2: any;
  apiSubscriptions: Subscription[] = [];
  assets: any[] = [];
  originalAssets: any[] = [];
  isNotificationLoading = false;
  notifications: any[] = [];
  notificationTableConfig: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  isFilterSelected = false;
  modalConfig: { jsonDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  selectedNotification: any;
  today = new Date();
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private toasterService: ToasterService
  ) {}

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.commonService.breadcrumbEvent.emit({
      type: 'replace',
      data: [
        {
          title: this.contextApp.user.hierarchyString,
          url: 'applications/' + this.contextApp.app,
        },
        {
          title: 'Notifications',
          url: 'applications/' + this.contextApp.app + '/notifications',
        },
      ],
    });
    this.filterObj.count = 10;
    this.filterObj.app = this.contextApp.app;
    this.filterObj.epoch = true;
    this.notificationTableConfig = {
      type: 'notification',
      data: [
        {
          name: 'Timestamp',
          key: 'local_created_date',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Asset',
          key: 'display_name',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Message',
          key: 'message_text',
          type: 'text',
          headerClass: '',
          valueclass: '',
        },
        {
          name: 'Message',
          key: undefined,
          type: 'button',
          headerClass: '',
          btnData: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View',
              valueclass: '',
              tooltip: 'View',
            },
          ],
        },
      ],
    };
    await this.getAllAssets();
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
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
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
      const hierarchyObj: any = { App: this.contextApp.app };
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      } else {
        const arr = [];
        this.assets = [];
        this.originalAssets.forEach((asset) => {
          let trueFlag = 0;
          let flaseFlag = 0;
          Object.keys(hierarchyObj).forEach((hierarchyKey) => {
            if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
              trueFlag++;
            } else {
              flaseFlag++;
            }
          });
          if (trueFlag > 0 && flaseFlag === 0) {
            arr.push(asset);
          }
        });
        this.assets = JSON.parse(JSON.stringify(arr));
      }
      if (this.assets?.length === 1) {
        this.filterObj.asset = this.assets[0];
      }
      // await this.getAssets(hierarchyObj);
    }
    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
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
    return c1 && c2 ? c1.asset_id === c2.asset_id : c1 === c2;
  }

  getAllAssets() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      };
      this.apiSubscriptions.push(
        this.assetService.getAllGatewaysAndAssetsList(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            this.originalAssets = JSON.parse(JSON.stringify(this.assets));
          }
          resolve();
        })
      );
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
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = moment(event.value).add(23, 'hours').add(59, 'minute').utc();
    const to = this.filterObj.to_date.valueOf;
    const current = moment().utc().valueOf;
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

  searchNotifications() {
    this.isFilterSelected = true;
    this.isNotificationLoading = true;
    const obj = { ...this.filterObj };
    const now = moment().utc();
    if (this.filterObj.dateOption === '5 mins') {
      obj.to_date = now.valueOf;
      obj.from_date = now.subtract(5, 'minute').valueOf;
    } else if (this.filterObj.dateOption === '30 mins') {
      obj.to_date = now.valueOf;
      obj.from_date = now.subtract(30, 'minute').valueOf;
    } else if (this.filterObj.dateOption === '1 hour') {
      obj.to_date = now.valueOf;
      obj.from_date = now.subtract(1, 'hour').valueOf;
    } else if (this.filterObj.dateOption === '24 hour') {
      obj.to_date = now.valueOf;
      obj.from_date = now.subtract(24, 'hour').valueOf;
    } else {
      if (this.filterObj.from_date) {
        obj.from_date = this.filterObj.from_date.valueOf;
      }
      if (this.filterObj.to_date) {
        obj.to_date = this.filterObj.to_date.valueOf;
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Notifications');
      this.isNotificationLoading = false;
      this.isFilterSelected = false;
      return;
    }
    obj.hierarchy = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    obj.asset_id = obj.asset?.asset_id;
    delete obj.asset;
    delete obj.dateOption;
    this.apiSubscriptions.push(
      this.assetService.getAssetNotifications(obj).subscribe(
        (response: any) => {
          if (response && response.data) {
            this.notifications = response.data;
            this.notifications.forEach((item) => {
              item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
              const name = this.originalAssets.filter((asset) => asset.asset_id === item.asset_id)[0].display_name;
              item.display_name = name ? name : item.asset_id;
              item.message_text = item.message;
            });
          }
          this.isNotificationLoading = false;
        },
        (error) => (this.isNotificationLoading = false)
      )
    );
  }

  openNotificationMessageModal(obj) {
    if (obj.type === this.notificationTableConfig.type) {
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true,
      };
      this.selectedNotification = obj.data;
      this.getMessageData(obj.data).then((message) => {
        this.selectedNotification.message = message;
      });
      $('#notificationMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
  }

  getMessageData(dataobj) {
    return new Promise((resolve) => {
      const obj = {
        app: dataobj.app,
        id: dataobj.id,
        from_date: null,
        to_date: null,
        epoch: true,
      };
      const epoch = this.commonService.convertDateToEpoch(dataobj.message_date);
      obj.from_date = epoch ? epoch - 300 : null;
      obj.to_date = epoch ? epoch + 300 : null;
      this.apiSubscriptions.push(
        this.assetService.getAssetMessageById(obj, 'notification').subscribe((response: any) => {
          resolve(response.message);
        })
      );
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
      $('#notificationMessageModal').modal('hide');
      this.selectedNotification = undefined;
    }
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((subscribe) => subscribe.unsubscribe());
  }
}
