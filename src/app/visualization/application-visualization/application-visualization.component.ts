import { filter } from 'rxjs/operators';
import { ColumnChartComponent } from './../../common/charts/column-chart/column-chart.component';
import { DataTableComponent } from './../../common/charts/data-table/data-table.component';
import { PieChartComponent } from './../../common/charts/pie-chart/pie-chart.component';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ToasterService } from './../../services/toaster.service';
import { Component, OnInit, OnDestroy, EmbeddedViewRef,
  ApplicationRef, ComponentFactoryResolver, Injector, Input, ViewChild } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from './../../services/common.service';
import { DeviceService } from './../../services/devices/device.service';
import * as moment from 'moment';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { LiveChartComponent } from 'src/app/common/charts/live-data/live-data.component';
import { BarChartComponent } from 'src/app/common/charts/bar-chart/bar-chart.component';
import { ChartService } from 'src/app/chart/chart.service';
import { SignalRService } from 'src/app/services/signalR/signal-r.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;
@Component({
  selector: 'app-application-visualization',
  templateUrl: './application-visualization.component.html',
  styleUrls: ['./application-visualization.component.css']
})
export class ApplicationVisualizationComponent implements OnInit, OnDestroy {

  @Input() device: any;
  @Input() pageType = 'live';
  userData: any;
  contextApp: any = {};
  latestAlerts: any[] = [];
  isAlertAPILoading = false;
  propertyList: any[] = [];
  selectedAlert: any;
  selectedDevice: any;
  refreshInterval: any;
  beforeInterval = 10;
  telemetryData: any[] = [];
  filterObj: any = {};
  originalFilterObj: any = {};
  devices: any[] = [];
  nonIPDevices: any[] = [];
  afterInterval = 10;
  seriesArr: any[] = [];
  isOpen = true;
  y2AxisProps: any[] = [];
  y1AxisProps: any[] = [];
  dropdownPropList: any[] = [];
  isTelemetryDataLoading = false;
  isTelemetryFilterSelected = false;
  acknowledgedAlert: any;
  dropdownWidgetList: any[];
  selectedWidgets: any[];
  propList: any[];
  showThreshold = false;
  selectedPropertyForChart: any[] = [];
  alertCondition: any = {};
  documents: any[] = [];
  configureHierarchy = {};
  hierarchyArr = {};
  tileData: any;
  signalRAlertSubscription: any;
  originalDevices: any[] = [];
  reasons: any[] = [];
  isAlertModalDataLoading = false;
  isChartViewOpen = true;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  acknowledgedAlertIndex: number = undefined;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  toDate: any;
  fromDate: any;
  subscriptions: Subscription[] = [];
  isFileUploading = false;
  today = new Date();
  loadingMessage: string;
  selectedTab: any;
  hierarchyString: any;
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    timePicker: true,
    autoUpdateInput: false,
    maxDate: moment(),
    ranges: CONSTANTS.DATE_OPTIONS
  };
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;
  displayHierarchyString: string;
  constructor(
    private commonService: CommonService,
    private deviceService: DeviceService,
    private deviceTypeService: DeviceTypeService,
    private toasterService: ToasterService,
    private chartService: ChartService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private sanitizer: DomSanitizer,
    private singalRService: SignalRService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    this.getTileName();
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
      }
    });
    if (this.pageType === 'history') {
      this.filterObj.device = this.device;
    }
    this.filterObj.app = this.contextApp.app;
    this.filterObj.count = 10;
    this.filterObj.type = true;
    this.filterObj.sampling_format = 'minute';
    this.filterObj.sampling_time = 1;
    this.filterObj.aggregation_minutes = 1;
    this.filterObj.aggregation_format = 'AVG';
    await this.getDevices(this.contextApp.user.hierarchy);

    this.loadFromCache();
  }

  loadFromCache() {
    let item;
    if (this.pageType === 'live') {
      item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    } else if (this.pageType === 'history') {
      item = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
    }
    if (item) {
      if (this.pageType === 'live') {
      if (item.devices) {
        this.filterObj.device = item.devices;
        this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
        }
      // this.filterObj = JSON.parse(JSON.stringify(item));
      if (item.hierarchy) {
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = item.hierarchy[level];
        if (item.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
        }
      });
      }
      }
      this.getLatestAlerts(false);
      } else if (this.pageType === 'history') {
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
          this.picker.datePicker.setStartDate(moment.unix(this.filterObj.from_date));
          this.picker.datePicker.setEndDate(moment.unix(this.filterObj.to_date));
          if (this.filterObj.dateOption !== 'Custom Range') {
            this.selectedDateRange = this.filterObj.dateOption;
          } else {
            this.selectedDateRange = moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') + ' to ' +
            moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
          }
          this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
          this.getLatestAlerts(false);
        }
      }

    }
  }

  onDeviceFilterBtnClick() {
    $('.dropdown-menu').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
  }

  selectedDate(value: any, datepicker?: any) {
    this.filterObj.dateOption = value.label;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = moment(value.start).utc().unix();
      this.filterObj.to_date = moment(value.end).utc().unix();
    }
    console.log(this.filterObj);
    if (value.label === 'Custom Range') {
      this.selectedDateRange = moment(value.start).format('DD-MM-YYYY HH:mm') + ' to ' + moment(value.end).format('DD-MM-YYYY HH:mm');
    } else {
      this.selectedDateRange = value.label;
    }
    if (this.filterObj.to_date - this.filterObj.from_date > 3600) {
      this.filterObj.isTypeEditable = true;
    } else {
      this.filterObj.isTypeEditable = false;
    }
  }

  onTabClick(type) {
    this.selectedTab = type;
  }

  onNumberChange(event, type) {
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.filterObj.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.filterObj.sampling_time = Math.floor(Number(event.target.value));
      }
    }
  }

  async onChangeOfHierarchy(i, persistDeviceSelection = true) {
    console.log(i);
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
    console.log('2088888');
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    const hierarchyObj: any = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (Object.keys(hierarchyObj).length === 1) {
      this.devices = JSON.parse(JSON.stringify(this.originalDevices));
    } else {
    const arr = [];
    this.devices = [];
    this.originalDevices.forEach(device => {
      let flag = false;
      Object.keys(hierarchyObj).forEach(hierarchyKey => {
        if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
          flag = true;
        } else {
          flag = false;
        }
      });
      if (flag) {
        arr.push(device);
      }
    });
    this.devices = JSON.parse(JSON.stringify(arr));
    }
    if (this.devices?.length === 1) {
      this.filterObj.device = this.devices[0];
    }
    console.log(persistDeviceSelection);
    if (persistDeviceSelection) {
      console.log('2477777');
      this.filterObj.deviceArr = undefined;
      this.filterObj.device = undefined;
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

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Alert Visualization') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
  }

  getDevices(hierarchy) {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.subscriptions.push(this.deviceService.getIPAndLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
            if (this.devices?.length === 1) {
              this.filterObj.device = this.devices[0];
            }
          }
          resolve();
        }
      ));
    });
  }


  onAssetSelection() {
    if (this.filterObj?.deviceArr.length > 0) {
      this.filterObj.device = this.filterObj.deviceArr[0];
    } else {
      this.filterObj.device = undefined;
      this.filterObj.deviceArr = undefined;
    }
  }

  onAssetDeselect() {
    this.filterObj.device = undefined;
    this.filterObj.deviceArr = undefined;
  }

  getLatestAlerts(updateFilterObj = true) {
    this.latestAlerts = [];
    this.isAlertAPILoading = true;
    // const filterObj = {
    //   app: this.contextApp.app,
    //   count: 10
    // };
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += (' > ' + this.configureHierarchy[key]);
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    if (this.pageType === 'history') {
      if (this.filterObj.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
      } else {
        this.filterObj.from_date = this.filterObj.from_date;
        this.filterObj.to_date = this.filterObj.to_date;
      }
    }
    const obj = {...this.filterObj};
    obj.hierarchy = { App: this.contextApp.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      delete obj.device;
    }
    delete obj.deviceArr;
    if (this.pageType === 'live') {
      const now = (moment().utc()).unix();
      obj.from_date = moment().subtract(24, 'hour').utc().unix();
      obj.to_date = now;
    } else {
      if (!obj.from_date || !obj.to_date) {
        this.toasterService.showError('Date selection is requierd.', 'Get Alert Data');
        this.isAlertAPILoading = false;
        return;
      }
    }
    if (updateFilterObj) {
      let pagefilterObj ;
      if (this.pageType === 'live') {
        pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
        if (!this.filterObj.device) {
          pagefilterObj.hierarchy = { App: this.contextApp.app};
          Object.keys(this.configureHierarchy).forEach((key) => {
            if (this.configureHierarchy[key]) {
              pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
            }
          });
        } else {
          pagefilterObj['hierarchy'] = this.filterObj.device.hierarchy;
          pagefilterObj['devices'] = this.filterObj.device;
        }
        this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
      } else if (this.pageType === 'history') {
        pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS) || {};
        pagefilterObj['from_date'] = obj.from_date;
        pagefilterObj['to_date'] = obj.to_date;
        pagefilterObj['dateOption'] = obj.dateOption;
        this.commonService.setItemInLocalStorage(CONSTANTS.CONTROL_PANEL_FILTERS, pagefilterObj);
      }
    }
    console.log(obj);
    this.subscriptions.push(this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        this.latestAlerts = response.data;
        if (this.latestAlerts.length > 0) {
          this.selectedAlert = undefined;
          this.onClickOfViewGraph(this.latestAlerts[this.acknowledgedAlertIndex || 0]);
          this.acknowledgedAlertIndex = undefined;
        } else {
          this.selectedAlert = undefined;
          this.selectedTab = undefined;
        }
        this.latestAlerts.forEach((item, i) =>  {
          item.alert_id = 'alert_' +  this.commonService.generateUUID();
          item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
          item.device_display_name = this.devices.filter(device => device.device_id === item.device_id)[0]?.display_name;
        });
        this.isAlertAPILoading = false;
        this.singalRService.disconnectFromSignalR('alert');
        this.signalRAlertSubscription?.unsubscribe();
        console.log(obj);
        console.log('filterObj', this.filterObj);
        if (this.pageType === 'live') {
          const obj1 = {
            levels: this.contextApp.hierarchy.levels,
            hierarchy: this.filterObj.device ? this.filterObj.device.hierarchy : JSON.parse(obj.hierarchy),
            type: 'alert',
            app: this.contextApp.app,
            device_id: obj.device_id,
          };
          console.log(obj1);
          this.singalRService.connectToSignalR(obj1);
          this.signalRAlertSubscription = this.singalRService.signalRAlertData.subscribe(
            msg => {
              this.getLiveAlerts(msg);
          });
        // clearInterval(this.refreshInterval);
        // this.refreshInterval = setInterval(() => {
        //   this.getLiveAlerts(obj);
        // }, 5000);
        }
      }, () => this.isAlertAPILoading = false
    ));
  }

  getLiveAlerts(obj) {
    obj.local_created_date = this.commonService.convertUTCDateToLocal(obj.timestamp);
    obj.message_date = obj.timestamp;
    obj.alert_id = 'alert_' + this.latestAlerts.length;
    this.latestAlerts.splice(0, 0, obj);
    // obj.count = 1;
    // if (obj.from_date) {
    //   obj.from_date = obj.from_date + 5;
    // }
    // if (obj.to_date) {
    //   obj.to_date = obj.to_date + 5;
    // }

    // this.deviceService.getDeviceAlerts(obj).subscribe(
    //   (response: any) => {
    //     if (response?.data?.length > 0) {
    //       this.latestAlerts = response.data;
    //       this.latestAlerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
    //     }
    //   });

  }


  getDeviceData(deviceId) {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        device_id: deviceId
      };
      const methodToCall =
        this.deviceService.getIPAndLegacyDevices(obj, obj.app);
      this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        if (response?.data?.length > 0) {
          this.selectedDevice = response.data[0];
        } else {
          this.selectedDevice = response;
        }
        resolve();
      }
      ));
    });
  }

  getAlertConditions() {
    return new Promise((resolve, reject) => {
      const filterObj = {
        app: this.contextApp.app,
        device_id: this.selectedAlert.device_id,
        device_type: this.selectedDevice.device_type,
        legacy: !(this.selectedAlert.device_id === this.selectedAlert.gateway_id)
      };
      if (this.selectedAlert.code) {
        filterObj['code'] = this.selectedAlert.code;
      } else if (this.selectedAlert.message) {
        filterObj['message'] = this.selectedAlert.message;
      }
      this.alertCondition = undefined;
      this.subscriptions.push(this.deviceTypeService.getAlertConditions(this.contextApp.app, filterObj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.alertCondition = response.data[0];
            if (this.alertCondition && !this.alertCondition.visualization_widgets) {
              this.alertCondition.visualization_widgets = [];
            }
            resolve();
          }
          if (response.data.length === 0) {
            this.isTelemetryDataLoading = false;
          }

        }, () =>  {
          reject();
          this.isTelemetryDataLoading = false;
        }
      ));
    });
  }

  onDeSelectAll(event) {
    this.selectedWidgets = [];
  }

  getDocuments() {
    return new Promise((resolve) => {
      this.documents = [];
      const obj = {
        app: this.contextApp.app,
        device_type: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.device_type
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelDocuments(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.documents = response.data;
            const arr = [];
            if (this.alertCondition) {
            this.alertCondition.reference_documents.forEach(refDoc => {
              this.documents.forEach(doc => {
                if (doc.id.toString() === refDoc.toString()) {
                  arr.push(doc.name);
                }
              });
            });
            this.alertCondition.reference_documents = arr;
            }
            resolve();
          }
        }
      ));
    });
  }

  onChangeTimeValue() {
    if (this.beforeInterval && this.afterInterval) {
      if (this.beforeInterval + this.afterInterval > 60) {

        this.filterObj.isTypeEditable = true;
      } else {
        this.filterObj.isTypeEditable = false;
      }
    }
  }

  getThingsModelProperties() {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.device_type
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => this.propertyList.push(prop));
          this.propertyList.forEach(item => {
            this.dropdownPropList.push({
              id: item.json_key
            });
          });
          resolve();
        }
      ));
    });
  }

  getLayout() {
    return new Promise((resolve) => {
    const params = {
      app: this.contextApp.app,
      name: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.device_type
    };
    this.dropdownWidgetList = [];
    this.selectedWidgets = [];
    this.subscriptions.push(this.deviceTypeService.getThingsModelLayout(params).subscribe(
      async (response: any) => {
        if (response?.historical_widgets?.length > 0) {
          response.historical_widgets.forEach((item) => {
            this.dropdownWidgetList.push({
              id: item.title,
              value: item
            });

            if (this.alertCondition) {
            this.alertCondition.visualization_widgets.forEach(widget => {
              if (widget === item.title) {
                this.selectedWidgets.push({
                  id: item.title,
                  value: item
                });
              }
            });
          }
          });
          this.dropdownWidgetList = JSON.parse(JSON.stringify(this.dropdownWidgetList));
          this.selectedWidgets = JSON.parse(JSON.stringify(this.selectedWidgets));
          if (this.selectedWidgets.length > 0) {
            this.getDeviceTelemetryData();
          } else {
            console.log('in else');
            this.isTelemetryDataLoading = false;
          }
        } else {
          this.isTelemetryDataLoading = false;
        }
        resolve();
      }));
    });
  }

  closeModal(id) {
    $('#' + id).modal('hide');
    this.selectedAlert = undefined;
  }

  async onClickOfViewGraph(alert) {
    this.selectedAlert = undefined;
    this.onTabClick('visualization');
    this.isOpen = true;
    this.beforeInterval = 1.5;
    this.afterInterval = 0.5;
    // $('#alertVisualizationModal').modal({ backdrop: 'static', keyboard: false, show: true });
    this.isAlertModalDataLoading = true;
    this.y1AxisProps = [];
    this.propList = [];
    this.y2AxisProps = [];
    this.selectedAlert = alert;
    this.filterObj.type = true;
    this.filterObj.sampling_format = 'minute';
    this.filterObj.sampling_time = 1;
    this.filterObj.aggregation_minutes = 1;
    this.filterObj.aggregation_format = 'AVG';
    if (this.selectedAlert?.metadata?.acknowledged_date) {
      this.selectedAlert.metadata.acknowledged_date = this.commonService.convertUTCDateToLocal(
        this.selectedAlert.metadata.acknowledged_date);
    }
    this.selectedAlert?.metadata?.files?.forEach(file => {
      file.data.sanitizedURL = this.sanitizeURL(file.data.url);
    });
    this.isTelemetryFilterSelected = false;
    this.isTelemetryDataLoading = true;
    this.selectedDevice = this.originalDevices.find(device => device.device_id === this.selectedAlert.device_id);
    // await this.getDeviceData(this.selectedAlert.device_id);
    await this.getAlertConditions();
    await this.getThingsModelProperties();
    await this.getDocuments();
    await this.getLayout();
    this.isAlertModalDataLoading = false;
  }

  compareFn(c1, c2): boolean {
    return c1 && c2 ? c1.device_id === c2.device_id : c1 === c2;
}

  getModelReasons() {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: this.alertCondition?.device_type ?  this.alertCondition.device_type : this.selectedDevice.device_type
      };
      this.subscriptions.push(this.deviceTypeService.getModelReasons(obj.app, obj.name).subscribe(
        (response: any) => {
          this.reasons = response.alert_acknowledge_reasons;
          resolve();
        }
      ));
    });
  }

  getPropertyName(key) {
    return this.propertyList.filter(prop => prop.json_key === key)[0]?.name || key;
  }

  getDeviceTelemetryData() {
    this.isChartViewOpen = false;
    this.propList = [];
    this.selectedWidgets.forEach(widget => {
      widget.value.y1axis.forEach(prop => {
        if (this.propList.indexOf(prop) === -1) {
          this.propList.push(prop);
        }
      });
      widget.value.y2axis.forEach(prop => {
        if (this.propList.indexOf(prop) === -1) {
          this.propList.push(prop);
        }
      });
    });
    this.selectedPropertyForChart = [];
    this.selectedPropertyForChart = [...this.propList];
    const children = $('#charts').children();
    for (const child of children) {
      $(child).remove();
    }
    this.telemetryData = [];
    const filterObj = JSON.parse(JSON.stringify(this.filterObj));
    filterObj.epoch = true;
    filterObj.app = this.contextApp.app;
    filterObj.device_id = this.selectedAlert.device_id;
    filterObj.message_props = '';
    filterObj.from_date = null;
    filterObj.to_date = null;

    this.propList.forEach((prop, index) =>
    filterObj.message_props += prop + (index !== (this.propList.length - 1) ? ',' : ''));
    if (this.beforeInterval > 0) {
      filterObj.from_date = (this.commonService.convertDateToEpoch(
        this.selectedAlert?.message_date || this.selectedAlert.timestamp)) - (this.beforeInterval * 60);
    } else {
      this.toasterService.showError('Minutes Before Alert value must be greater than 0 and less than 30.', 'View Visualization');
      return;
    }
    if (this.afterInterval > 0) {
      filterObj.to_date = (this.commonService.convertDateToEpoch(
        this.selectedAlert?.message_date || this.selectedAlert.timestamp)) + (this.afterInterval * 60);
    } else {
      this.toasterService.showError('Minutes After Alert value must be greater than 0 and less than 30.', 'View Visualization');
      return;
    }
    let method;
    if (filterObj.to_date - filterObj.from_date > 3600 && !this.filterObj.isTypeEditable) {
        this.filterObj.isTypeEditable = true;
        this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
        return;
    }
    const device = this.devices.find(deviceObj => deviceObj.device_id ===  filterObj.device_id);
    filterObj.partition_key = device.partition_key;
    delete filterObj.count;
    delete filterObj.device;
    this.isChartViewOpen = true;
    filterObj.order_dir = 'ASC';
    if (this.filterObj.isTypeEditable) {
      if (this.filterObj.type) {
        if (!this.filterObj.sampling_time || !this.filterObj.sampling_format ) {
          this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
          return;
        } else {
          delete filterObj.aggregation_minutes;
          delete filterObj.aggregation_format;
          const records = this.commonService.calculateEstimatedRecords(this.filterObj.sampling_time * 60,
            filterObj.from_date, filterObj.to_date);
            if (records > 500 ) {
              this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
            }
          method = this.deviceService.getDeviceSamplingTelemetry(filterObj, this.contextApp.app);
        }
      } else {
        if (!this.filterObj.aggregation_minutes || !this.filterObj.aggregation_format ) {
          this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
          return;
        } else {
          delete filterObj.sampling_time;
          delete filterObj.sampling_format;
          const records = this.commonService.calculateEstimatedRecords
          (this.filterObj.aggregation_minutes * 60, filterObj.from_date, filterObj.to_date);
          this.loadingMessage = 'Loading ' + records + ' data points.' + (records > 100 ? 'It may take some time.' : '') + 'Please wait...';
          method = this.deviceService.getDeviceTelemetry(filterObj);
        }
      }
    } else {
      delete filterObj.aggregation_minutes;
      delete filterObj.aggregation_format;
      delete filterObj.sampling_time;
      delete filterObj.sampling_format;
      const records = this.commonService.calculateEstimatedRecords
          ((device?.measurement_frequency?.average ? device.measurement_frequency.average : 5),
          filterObj.from_date, filterObj.to_date);
      if (records > 500 ) {
        this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
      }
      method = this.deviceService.getDeviceTelemetry(filterObj);
    }
    this.fromDate = filterObj.from_date;
    this.toDate = filterObj.to_date;
    if (this.selectedWidgets.length === 0) {
      this.toasterService.showError('Please select at least one widget.', 'View Visualization');
      return;
    }
    this.isOpen = false;
    this.isTelemetryFilterSelected = true;
    this.isTelemetryDataLoading = true;

    // this.y2AxisProps.forEach((prop, index) =>
    // filterObj.message_props += prop.id + (index !== (this.y2AxisProps.length - 1) ? ',' : ''));
    // if (filterObj.message_props.charAt(filterObj.message_props.length - 1) === ',') {
    //   filterObj.message_props = filterObj.message_props.substring(0, filterObj.message_props.length - 1);
    // }
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetryData = response.data;
          const telemetryData = response.data;
          this.isChartViewOpen = true;
          telemetryData.forEach(item => {
            item.message_date = this.commonService.convertUTCDateToLocal(item.message_date);
          });
          // this.loadGaugeChart(telemetryData[0]);
          // telemetryData.reverse();
          this.isTelemetryDataLoading = false;
          // this.loadLineChart(telemetryData);
          if (telemetryData.length > 0) {
          this.selectedWidgets.forEach(widget => {
            let componentRef;
            if (widget.value.chartType === 'LineChart' || widget.value.chartType === 'AreaChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(LiveChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'ColumnChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(ColumnChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'BarChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(BarChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'PieChart') {
              componentRef = this.factoryResolver.resolveComponentFactory(PieChartComponent).create(this.injector);
            } else if (widget.value.chartType === 'Table') {
              componentRef = this.factoryResolver.resolveComponentFactory(DataTableComponent).create(this.injector);
            }
            componentRef.instance.telemetryData = JSON.parse(JSON.stringify(telemetryData));
            componentRef.instance.selectedAlert = JSON.parse(JSON.stringify(this.selectedAlert));
            componentRef.instance.propertyList = this.propertyList;
            componentRef.instance.y1AxisProps = widget.value.y1axis;
            componentRef.instance.y2AxisProps = widget.value.y2axis;
            componentRef.instance.xAxisProps = widget.value.xAxis;
            componentRef.instance.chartType = widget.value.chartType;
            componentRef.instance.chartStartdate = this.fromDate;
            componentRef.instance.chartEnddate = this.toDate;
            componentRef.instance.chartHeight = '23rem';
            componentRef.instance.chartWidth = '100%';
            componentRef.instance.chartTitle = widget.value.title;
            componentRef.instance.chartId = widget.value.chart_Id;
            this.appRef.attachView(componentRef.hostView);
            const domElem = (componentRef.hostView as EmbeddedViewRef<any>)
            .rootNodes[0] as HTMLElement;
            document.getElementById('charts').prepend(domElem);
          });
          }
        }
      }
    ));
  }

  toggleProperty(prop) {
    const index = this.selectedPropertyForChart.indexOf(prop);
    if (index === -1) {
      this.selectedPropertyForChart.push(prop);
    } else {
      this.selectedPropertyForChart.splice(index, 1);
    }
    this.chartService.togglePropertyEvent.emit(prop);
  }

  toggleThreshold() {
    this.chartService.toggleThresholdEvent.emit(this.showThreshold);
  }

  async onClickOfAcknowledgeAlert(alert): Promise<void> {
    this.acknowledgedAlert = alert;
    this.acknowledgedAlertIndex = this.latestAlerts.findIndex(alertObj => alertObj.id === alert.id);
    if (!this.acknowledgedAlert || !this.acknowledgedAlert.metadata) {
      this.acknowledgedAlert.metadata = {
        files: [{
          type: undefined,
          data : {}
        }]
      };
    } else if (!this.acknowledgedAlert.metadata.files || this.acknowledgedAlert.metadata.files.length === 0) {
      this.acknowledgedAlert.metadata.files =  [{
        type: undefined,
        data : {}
      }];
    }
    await this.getDeviceData(this.acknowledgedAlert.device_id);
    await this.getModelReasons();
    $('#acknowledgemenConfirmModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  sanitizeURL(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + url + this.sasToken);
  }

  addDocument() {
    let msg = '';
    this.acknowledgedAlert.metadata.files.forEach(file => {
      if (!file.type || !file?.data?.url || !file?.data?.name) {
        msg = 'Please select file.';
      }
    });
    if (msg) {
      this.toasterService.showError(msg, 'Acknowledge Alert');
      return;
    }
    this.acknowledgedAlert.metadata.files.push({
      type: undefined,
      data : {}
    });
   }

  async onDocumentFileSelected(files: FileList, index): Promise<void> {
    const arr = files?.item(0)?.name?.split('.') || [];
    if (!files?.item(0).type.includes(this.acknowledgedAlert.metadata.files[index].type?.toLowerCase())) {
      this.toasterService.showError('This file is not valid for selected document type', 'Select File');
      return;
    }

    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0),
    'devices/' + this.acknowledgedAlert.device_id + '/alerts/' + this.acknowledgedAlert.code);
    if (data) {
      this.acknowledgedAlert.metadata.files[index].data = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }


  acknowledgeAlert(): void {
    const files = [];
    this.acknowledgedAlert.metadata.files.forEach(file => {
      if (file.type && file?.data?.url && file?.data?.name) {
        files.push(file);
      }
    });
    this.acknowledgedAlert.metadata.files = files;
    const obj = {
      app: this.contextApp.app,
      device_id: this.acknowledgedAlert.device_id,
      message_id: this.acknowledgedAlert.message_id,
      message_date: this.acknowledgedAlert.message_date,
      code: this.acknowledgedAlert.code,
      message: this.acknowledgedAlert.message,
      metadata: this.acknowledgedAlert.metadata,
      from_date: null,
      to_date: null,
      epoch: true
    };
    const epoch =  this.commonService.convertDateToEpoch(this.acknowledgedAlert.message_date);
    obj.from_date = epoch ? (epoch - 300) : null;
    obj.to_date = (epoch ? (epoch + 300) : null);
    obj.metadata['user_id'] = this.userData.name;
    obj.metadata['acknowledged_date'] = (moment.utc(new Date(), 'M/DD/YYYY h:mm:ss A'));
    this.subscriptions.push(this.deviceService.acknowledgeDeviceAlert(obj).subscribe(
      response => {
        this.toasterService.showSuccess('Alert acknowledged successfully', 'Acknowledge Alert');
        this.getLatestAlerts();
        this.closeAcknowledgementModal();
       // this.getAlarms();
      }, (error) => {
        this.toasterService.showError(error.message, 'Acknowledge Alert');
      }
    ));
  }



  closeAcknowledgementModal(flag = false): void {
    $('#acknowledgemenConfirmModal').modal('hide');
    if (flag) {
    this.latestAlerts.forEach(alert => {
      if ((alert?.id === this.acknowledgedAlert?.id) || alert?.alert_id === this.acknowledgedAlert?.alert_id) {
        alert.metadata = {};
      }
    });
    }
    this.acknowledgedAlert = undefined;

  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.signalRAlertSubscription?.unsubscribe();
    this.singalRService.disconnectFromSignalR('alert');
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.y1AxisProps = [];
    }
  }
  y2Deselect(e){
    if (e === [] || e.length === 0) {
      this.y2AxisProps = [];
    }
  }


}
