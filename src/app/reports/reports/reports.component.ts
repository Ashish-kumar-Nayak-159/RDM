import { filter } from 'rxjs/operators';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ToasterService } from './../../services/toaster.service';
import { DeviceService } from './../../services/devices/device.service';
import { ApplicationService } from './../../services/application/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from './../../services/common.service';
import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Subscription } from 'rxjs';
import { DaterangepickerComponent } from 'ng2-daterangepicker';
declare var $: any;
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {

  userData: any;
  filterObj: any = {};
  contextApp: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  devices: any[] = [];
  nonIPDevices: any[] = [];
  originalDevices: any[] = [];
  isTelemetryLoading = false;
  telemetry: any[] = [];
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  latestAlerts: any[] = [];
  isFileDownloading = false;
  pdfOptions = {
    paperSize: 'A4',
    margin: { left: '0.75cm', top: '0.60cm', right: '0.75cm', bottom: '0.60cm' },
    scale: 0.42,
    landscape: true
  };
  originalFilterObj: any = {};
  tabType = 'pre-generated';
  isFilterSelected = false;
  props: any[] = [];
  selectedProps: any[] = [];
  newFilterObj: any;
  tileData: any;
  deviceFilterObj: any;
  subscriptions: Subscription[] = [];
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  currentOffset = 0;
  currentLimit = 100;
  insideScrollFunFlag = false;
  isFilterOpen = true;
  today = new Date();
  activeTab = 'pre_generated_reports';
  loadingMessage: any;
  daterange: any = {};
  options: any = {
    locale: { format: 'DD-MM-YYYY HH:mm' },
    alwaysShowCalendars: false,
    autoUpdateInput: false,
    maxDate: moment(),
    timePicker: true,
    ranges: CONSTANTS.DATE_OPTIONS
  };
  reportsFetchDataSubscription: Subscription;
  @ViewChild(DaterangepickerComponent) private picker: DaterangepickerComponent;
  selectedDateRange: string;

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.subscriptions.push(this.route.paramMap.subscribe(async params => {
      if (params.get('applicationId')) {
        this.filterObj.app = this.contextApp.app;
       // this.filterObj.count = 10;
      }
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
      this.filterObj.type = true;
      this.filterObj.sampling_format = 'minute';
      this.filterObj.sampling_time = 1;
      this.filterObj.aggregation_minutes = 1;
      this.filterObj.aggregation_format = 'AVG';
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      console.log(this.originalFilterObj.report_type);
     // this.getLatestAlerts();
      await this.getDevices(this.contextApp.user.hierarchy);
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
    }));

  }

  loadFromCache() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    if (item) {
      if (item.devices) {
      this.filterObj.device = item.devices;

      }
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
        if (this.filterObj.to_date - this.filterObj.from_date > 3600) {
          this.filterObj.isTypeEditable = true;
        } else {
          this.filterObj.isTypeEditable = false;
        }
      }
      console.log(this.originalFilterObj);

      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      console.log(this.originalFilterObj.report_type);
      // if (this.filterObj.device) {
      //   this.onFilterSelection(false, false);
      // }
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Reports') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    this.currentLimit = Number(this.tileData[1]?.value) || 100;
  }

  onDeviceFilterBtnClick() {
    $('.dropdown-menu').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
  }

  selectedDate(value: any, datepicker?: any) {
    // this.filterObj.from_date = moment(value.start).utc().unix();
    // this.filterObj.to_date = moment(value.end).utc().unix();
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

  async onChangeOfHierarchy(i, persistDeviceSelection = true) {
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
    if (persistDeviceSelection) {
    this.filterObj.deviceArr = undefined;
    this.filterObj.device = undefined;
    }
    this.props = [];
    this.dropdownPropList = [];
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

  onAssetDeselect() {
    this.filterObj.device = undefined;
    this.filterObj.deviceArr = undefined;
  }

  onAssetSelection() {
    // this.nonIPDevices = [];
    // this.filterObj.device_id = this.filterObj.device.device_id;
    if (this.filterObj.device) {
    const device_type = this.filterObj?.device?.device_type;

    if (device_type) {
      this.getThingsModelProperties(device_type);
    }
    } else {
      this.dropdownPropList = [];
      this.propertyList = [];
      this.props = [];
    }
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

  onNonIPDeviceChange() {
    // this.filterObj.device_id = this.filterObj.device.device_id;
    console.log(this.originalFilterObj.report_type);
    if (this.filterObj.report_type === 'Process Parameter Report') {
    if (this.filterObj.device) {
      const device_type = this.filterObj.device.device_type;
      if (device_type) {
        this.getThingsModelProperties(device_type);
      }
      }
    }
    console.log(this.originalFilterObj.report_type);
  }

  getThingsModelProperties(deviceType) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: deviceType
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          response.properties?.measured_properties.forEach(prop => prop.type = 'Measured Properties');
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => {
            prop.type = 'Derived Properties';
            this.propertyList.push(prop);
          });
          this.dropdownPropList = [];
          this.props = [];
          this.propertyList.forEach(prop => {
            this.dropdownPropList.push({
              id: prop.name,
              type: prop.type,
              value: prop
            });
          });
          this.dropdownPropList = JSON.parse(JSON.stringify(this.dropdownPropList));
          console.log(this.dropdownPropList);
          // this.props = [...this.dropdownPropList];
          resolve();
        }
      ));
    });
  }

  onScrollFn() {
    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
        parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
          this.currentOffset += this.currentLimit;
          this.onFilterSelection(false, false);
        }
      });
    }, 1000);

  }

  onFilterSelection(callScrollFnFlag = false, updateFilterObj = true) {
    this.insideScrollFunFlag = true;
    this.deviceFilterObj = undefined;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = this.filterObj.from_date;
      this.filterObj.to_date = this.filterObj.to_date;
    }
    const obj = {...this.filterObj};
    let device_type: any;
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      device_type = obj.device.device_type;
      delete obj.device;
    }
    if (!obj.report_type) {
      this.toasterService.showError('Report Type selection is required', 'View Report');
      return;
    }
    if (!obj.device_id) {
      this.toasterService.showError('Asset selection is required', 'View Report');
      return;
    }
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    this.deviceFilterObj = this.filterObj.device;
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is required', 'View Report');
      return;
    }
    if (obj.report_type === 'Process Parameter Report' && this.props.length === 0) {
      this.toasterService.showError('Please select properties to view data', 'View Telemetry');
      return;
    }
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS)
      pagefilterObj['hierarchy'] = this.filterObj.device.hierarchy;
      pagefilterObj['devices'] = this.filterObj.device;
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    console.log(this.originalFilterObj.report_type);
    this.isTelemetryLoading = true;
    // this.telemetry = [];
    // this.latestAlerts = [];

    this.selectedProps = JSON.parse(JSON.stringify(this.props));
    this.newFilterObj = JSON.parse(JSON.stringify(obj));
    this.isFilterSelected = true;
    if (obj.report_type === 'Process Parameter Report') {
      this.getTelemetryData(obj, undefined, callScrollFnFlag);
    } else if (obj.report_type === 'Alert Report') {
      this.getAlertData(obj, undefined, callScrollFnFlag);
    }

  }

  getAlertData(obj, type = undefined, callScrollFnFlag = false) {
    return new Promise<void>((resolve) => {
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    this.loadingMessage = 'Loading data. Please wait...';
    if (type === 'all') {
      delete obj.count;
    }
    delete obj.report_type;
    delete obj.deviceArr;
    this.reportsFetchDataSubscription = this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        // response.data.reverse();
        response.data.forEach(item => {
          item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
          item.device_display_name = this.devices.filter(device => device.device_id === item.device_id)[0]?.display_name;
        });
        this.latestAlerts = [...this.latestAlerts, ...response.data];
        this.isFilterOpen = false;
        if (response.data.length === this.currentLimit) {
          this.insideScrollFunFlag = false;
        } else {
          this.insideScrollFunFlag = true;
        }
        if (callScrollFnFlag) {
          this.onScrollFn();
        }
        resolve();
        if (this.filterObj.dateOption === 'Custom Range') {
          this.originalFilterObj.dateOption = 'this selected range';
        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    );
    this.subscriptions.push(this.reportsFetchDataSubscription);
    });
  }

  onTabSelect(type) {
    this.tabType = type;
    if (type === 'custom') {
      this.filterObj = {};
      this.filterObj.app = this.contextApp.app;
      this.filterObj.type = true;
      this.filterObj.sampling_format = 'minute';
      this.filterObj.sampling_time = 1;
      this.filterObj.aggregation_minutes = 1;
      this.filterObj.aggregation_format = 'AVG';
      this.originalFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      console.log(this.originalFilterObj.report_type);
      this.telemetry = [];
      this.latestAlerts = [];
      this.isFilterOpen = true;
      this.isFilterSelected = false;
      this.loadFromCache();
    } else {
      this.isFilterSelected = false;
    }

  }

  async getTelemetryData(filterObj, type = undefined, callScrollFnFlag = false) {
    return new Promise<void>((resolve) => {
    const obj = JSON.parse(JSON.stringify(filterObj));
    delete obj.dateOption;
    delete obj.isTypeEditable;
    delete obj.type;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    // obj.order_dir = 'ASC';
    if (type === 'all') {
      delete obj.count;
    }

    delete obj.report_type;
    delete obj.deviceArr;
    this.isTelemetryLoading = false;
    this.isFilterSelected = false;
    const device = this.devices.find(deviceObj => deviceObj.device_id ===  obj.device_id);
    obj.partition_key = device.partition_key;
    let method;
    if (obj.to_date - obj.from_date > 3600 && !filterObj.isTypeEditable) {
        this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
        return;
    }
    if (this.props.length > 50) {
      this.toasterService.showError('Please select less than 50 properties at a time.', 'View Telemetry');
      return;
    }
    if (filterObj.isTypeEditable) {
    if (filterObj.type) {
      if (!filterObj.sampling_time || !filterObj.sampling_format ) {
        this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
        return;
      } else {
        delete obj.aggregation_minutes;
        delete obj.aggregation_format;
        let measured_message_props = '';
        let derived_message_props = '';
        this.props.forEach((prop, index) => {
          if (prop.value.type === 'Derived Properties') {
            derived_message_props = derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          } else {
            measured_message_props = measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          }
        });
        measured_message_props = measured_message_props.replace(/,\s*$/, '');
        derived_message_props = derived_message_props.replace(/,\s*$/, '');
        obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
        obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
        const records = this.commonService.calculateEstimatedRecords(filterObj.sampling_time * 60, obj.from_date, obj.to_date);
        if (records > 500 ) {
          this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
        }
        method = this.deviceService.getDeviceSamplingTelemetry(obj, this.contextApp.app);
      }
    } else {
      if (!filterObj.aggregation_minutes || !filterObj.aggregation_format ) {
        this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
        return;
      } else {
        delete obj.sampling_time;
        delete obj.sampling_format;
        let measured_message_props = '';
        let derived_message_props = '';
        this.props.forEach((prop, index) => {
          if (prop.value.type === 'Derived Properties') {
            derived_message_props = derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          } else {
            measured_message_props = measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          }
        });
        measured_message_props = measured_message_props.replace(/,\s*$/, '');
        derived_message_props = derived_message_props.replace(/,\s*$/, '');
        obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
        obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
        const records = this.commonService.calculateEstimatedRecords
          (filterObj.aggregation_minutes * 60, obj.from_date, obj.to_date);
        if (records > 500 ) {
          this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
        }
        method = this.deviceService.getDeviceTelemetry(obj);
      }
    }
    } else {
      delete obj.aggregation_minutes;
      delete obj.aggregation_format;
      delete obj.sampling_time;
      delete obj.sampling_format;
      if (this.props.length === this.propertyList.length && !obj.sampling_format && !obj.aggregation_format) {
        obj['all_message_props'] = true;
      } else {
        // let message_props = '';
        // this.props.forEach((prop, index) => message_props = message_props + prop.value.json_key +
        // (this.props[index + 1] ? ',' : ''));
        // obj['message_props'] = message_props;
        let measured_message_props = '';
        let derived_message_props = '';
        this.props.forEach((prop, index) => {
          if (prop.value.type === 'Derived Properties') {
            derived_message_props = derived_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          } else {
            measured_message_props = measured_message_props + prop.value.json_key + (this.props[index + 1] ? ',' : '');
          }
        });
        measured_message_props = measured_message_props.replace(/,\s*$/, '');
        derived_message_props = derived_message_props.replace(/,\s*$/, '');
        obj['measured_message_props'] = measured_message_props ? measured_message_props : undefined;
        obj['derived_message_props'] = derived_message_props ? derived_message_props : undefined;
      }
      const records = this.commonService.calculateEstimatedRecords
          ((device?.measurement_frequency?.average ? device.measurement_frequency.average : 5),
          filterObj.from_date, filterObj.to_date);
      if (records > 500 ) {
        this.loadingMessage = 'Loading approximate ' + records + ' data points.' + ' It may take some time.' + ' Please wait...';
      }
      method = this.deviceService.getDeviceTelemetry(obj);
    }

    this.isTelemetryLoading = true;
    this.isFilterSelected = true;
    this.reportsFetchDataSubscription = method.subscribe(
      (response: any) => {
        if (response && response.data) {
          // this.telemetry = response.data;
          response.data.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
          this.telemetry = [...this.telemetry, ...response.data];
          this.isFilterOpen = false;
          if (response.data.length === this.currentLimit) {
            this.insideScrollFunFlag = false;
          } else {
              this.insideScrollFunFlag = true;
          }
          this.loadingMessage = undefined;
          // this.telemetry.reverse();
        }
        if (callScrollFnFlag) {
          this.onScrollFn();
        }
        if (this.filterObj.dateOption === 'Custom Range') {
          this.originalFilterObj.dateOption = 'this selected range';
        }
        this.isTelemetryLoading = false;
        resolve();
      }, error => this.isTelemetryLoading = false
    );
    this.subscriptions.push(this.reportsFetchDataSubscription);
    });
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.props = [];
    }
  }

  scrollToTop(){
      $('#table-top1').animate({ scrollTop: "0px" });
      //window.scrollTo(0, 0);
  }

  async savePDF(): Promise<void> {
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && this.props.length > 8) {
      this.toasterService.showWarning('For more properties, Excel Reports work better.', 'Export as PDF');
    }
    $('#downloadReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getTelemetryData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    } else if (this.originalFilterObj.report_type === 'Alert Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getAlertData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    }
    this.loadingMessage = 'Preparing Report.';
    this.isFileDownloading = true;
    setTimeout(() => {
      const pdf = new jsPDF('p', 'pt', 'A3');
      pdf.text(this.originalFilterObj.report_type + ' for ' +
      (this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id) +
      ' for ' + this.commonService.convertEpochToDate(this.newFilterObj.from_date) + ' to ' +
      this.commonService.convertEpochToDate(this.newFilterObj.to_date), 20, 50);
      autoTable(pdf, { html: '#dataTable1', margin: { top: 70 } });
      const now = moment().utc().unix();
      pdf.save((this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id)
             + '_' + this.originalFilterObj.report_type + '_' + now + '.pdf');
      this.isFileDownloading = false;
      this.loadingMessage = undefined;
      $('#downloadReportModal').modal('hide');
    }, 1000);

  }

  async saveExcel() {
    this.isFileDownloading = true;
    let ws: XLSX.WorkSheet;
    let data = [];
    $('#downloadReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    if (this.originalFilterObj.report_type === 'Process Parameter Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getTelemetryData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    } else if (this.originalFilterObj.report_type === 'Alert Report' && !this.insideScrollFunFlag) {
      this.currentOffset += this.currentLimit;
      await this.getAlertData(this.newFilterObj, 'all');
      this.insideScrollFunFlag = true;
    }
    this.loadingMessage = 'Preparing Report.';
    setTimeout(() => {
      if (this.originalFilterObj.report_type === 'Alert Report') {
        this.latestAlerts.forEach(alert => {
          data.push({
            'Asset Name': (this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id),
            Time: alert.local_created_date,
            Severity: alert.severity,
            Description: alert.message,
            Source: alert.source,
            Status: alert.metadata?.acknowledged_date ? 'Acknowledged' : 'Not Acknowledged',
            'Acknowledged By': alert.metadata?.user_id
          });
        });
        // const element = document.getElementById('dataTable');
        ws = XLSX.utils.json_to_sheet(data);
      } else {
        data = [];
        this.telemetry.forEach(telemetryObj => {
          const obj = {
            'Asset Name': this.originalFilterObj.non_ip_device ?
              (this.originalFilterObj.non_ip_device.device_display_name ? this.originalFilterObj.non_ip_device?.device_display_name
                : this.originalFilterObj.non_ip_device?.device_id)
              : (this.deviceFilterObj ?
              (this.deviceFilterObj.device_display_name ? this.deviceFilterObj.device_display_name : this.deviceFilterObj.device_id)
              : '' ),
            Time: telemetryObj.local_created_date
          };
          this.selectedProps.forEach(prop => {
            obj[prop.id] = telemetryObj[prop.value.json_key];
          });
          data.push(obj);
        });
        ws = XLSX.utils.json_to_sheet(data);
      }
      const colA = XLSX.utils.decode_col('B'); // timestamp is in first column
      const fmt = 'DD-MMM-YYYY hh:mm:ss.SSS'; // excel datetime format
      // get worksheet range
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let i = range.s.r + 1; i <= range.e.r; ++i) {
        /* find the data cell (range.s.r + 1 skips the header row of the worksheet) */
        const ref = XLSX.utils.encode_cell({ r: i, c: colA });
        /* if the particular row did not contain data for the column, the cell will not be generated */
        if (!ws[ref]) {
          continue;
        }
        /* `.t == "n"` for number cells */
        if (ws[ref].t !== 'n') {
          continue;
        }
        /* assign the `.z` number format */
        ws[ref].z = fmt;
      }
      // width of timestamp col
      const wscols = [
        { wch: 10 }
      ];
      ws['!cols'] = wscols;
      /* generate workbook and add the worksheet */
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const now = moment().utc().unix();
      /* save to file */
      XLSX.writeFile(wb, (this.originalFilterObj.device.display_name ? this.originalFilterObj.device.display_name
        : this.originalFilterObj.device.device_id)
        + '_' + this.originalFilterObj.report_type + '_' + now + '.xlsx');
      this.loadingMessage = undefined;
      $('#downloadReportModal').modal('hide');
    }, 1000);
  }

  cancelDownloadModal() {
    this.reportsFetchDataSubscription?.unsubscribe();
    this.loadingMessage = undefined;
    this.isTelemetryLoading = false;
    $('#downloadReportModal').modal('hide');
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
