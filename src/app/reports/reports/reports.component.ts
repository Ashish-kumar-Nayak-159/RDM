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
  isFilterSelected = false;
  props: any[] = [];
  selectedProps: any[] = [];
  newFilterObj: any;
  tileData: any;
  deviceFilterObj: any;
  subscriptions: Subscription[] = [];
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;

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
    this.route.paramMap.subscribe(async params => {
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
            this.onChangeOfHierarchy(index);
          }
        }
      });
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.contextApp.user.hierarchyString,
            url: 'applications/' + this.contextApp.app
          },
            {
              title: this.tileData && this.tileData[0] ? this.tileData[0]?.value : '',
              url: 'applications/' + this.contextApp.app + '/visualization'
            }
        ]
      });
      this.filterObj.type = true;
      this.filterObj.sampling_format = 'minute';
      this.filterObj.sampling_frequency_in_mins = 5;
      this.filterObj.aggregation_minutes = 5;
      this.filterObj.aggregation_format = 'AVG';
     // this.getLatestAlerts();
      await this.getDevices(this.contextApp.user.hierarchy);
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
    });

  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if (item.system_name === 'Reports') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem;
  }

  getDevices(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_DEVICE + ',' + CONSTANTS.NON_IP_DEVICE
      };
      this.subscriptions.push(this.deviceService.getAllDevicesList(obj, this.contextApp.app).subscribe(
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

  async onChangeOfHierarchy(i) {
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
    this.filterObj.device = undefined;
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
    console.log(event);
    if (Number(event.target.value) % 1 !== 0) {
      this.toasterService.showError('Decimal values are not allowed.', 'View Report');
      if (type === 'aggregation') {
        this.filterObj.aggregation_minutes = Math.floor(Number(event.target.value));
      } else {
        this.filterObj.sampling_frequency_in_mins = Math.floor(Number(event.target.value));
      }
    }
  }

  onNonIPDeviceChange() {
    // this.filterObj.device_id = this.filterObj.device.device_id;
    if (this.filterObj.report_type === 'Process Parameter Report') {
    if (this.filterObj.device) {
      const device_type = this.filterObj.device.device_type;
      if (device_type) {
        this.getThingsModelProperties(device_type);
      }
      }
    }
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
    if (this.filterObj.dateOption === '24 hour') {
      this.filterObj.isTypeEditable = true;
    } else {
      this.filterObj.isTypeEditable = false;
    }
  }

  onDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    console.log(this.filterObj.from_date.unix());
    console.log(this.filterObj.to_date.unix());
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
    const from = this.filterObj.from_date.unix();
    const to = this.filterObj.to_date.unix();
    if (to - from > 3600) {
      this.filterObj.isTypeEditable = true;
    } else {
      this.filterObj.isTypeEditable = false;
    }
  }

  onSingleDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = ((moment(event.value).add(23, 'hours')).add(59, 'minute')).utc();
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
    const from = this.filterObj.from_date.unix();
    const to = this.filterObj.to_date.unix();
    if (to - from > 3600) {
      this.filterObj.isTypeEditable = true;
    } else {
      this.filterObj.isTypeEditable = false;
    }
  }

  getThingsModelProperties(deviceType) {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: deviceType
      };
      this.subscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => this.propertyList.push(prop));
          this.dropdownPropList = [];
          this.props = [];
          this.propertyList.forEach(prop => {
            this.dropdownPropList.push({
              id: prop.name,
              value: prop
            });
          });
          this.props = [...this.dropdownPropList];
          resolve();
        }
      ));
    });
  }

  onFilterSelection() {
    this.deviceFilterObj = undefined;
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
    this.deviceFilterObj = this.filterObj.device;
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
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is required', 'View Report');
      return;
    }
    this.isTelemetryLoading = true;
    this.telemetry = [];
    this.latestAlerts = [];
    this.selectedProps = JSON.parse(JSON.stringify(this.props));
    this.newFilterObj = JSON.parse(JSON.stringify(obj));
    this.isFilterSelected = true;
    if (obj.report_type === 'Process Parameter Report') {
      this.getTelemetryData(obj);
    } else if (obj.report_type === 'Alert Report') {
      this.getAlertData(obj);
    }
  }

  getAlertData(obj) {
    this.subscriptions.push(this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        this.latestAlerts = response.data;
        this.latestAlerts.reverse();
        this.latestAlerts.forEach(item => {
          item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date);
          item.device_display_name = this.devices.filter(device => device.device_id === item.device_id)[0]?.display_name;
        });
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }

  async getTelemetryData(filterObj) {
    const obj = JSON.parse(JSON.stringify(filterObj));
    let message_props = '';
    this.props.forEach((prop, index) => message_props = message_props + prop.value.json_key + (this.props[index + 1] ? ',' : ''));
    obj['message_props'] = message_props;

    // if (obj.to_date - obj.from_date <= 3600) {
    //   method = this.deviceService.getDeviceTelemetry(obj);
    // } else {
    //   method = this.deviceService.getDeviceSamplingTelemetry(obj, this.contextApp.app);
    // }
    delete obj.dateOption;
    delete obj.isTypeEditable;
    delete obj.type;
    obj.order_dir = 'ASC';
    this.isTelemetryLoading = false;
    this.isFilterSelected = false;
    let method;
    if (obj.to_date - obj.from_date > 3600 && !filterObj.isTypeEditable) {
        this.toasterService.showError('Please select sampling or aggregation filters.', 'View Telemetry');
        return;
    }
    if (filterObj.isTypeEditable) {
    if (filterObj.type) {
      if (!filterObj.sampling_frequency_in_mins || !filterObj.sampling_format ) {
        this.toasterService.showError('Sampling time and format is required.', 'View Telemetry');
        return;
      } else {
        delete obj.aggregation_minutes;
        delete obj.aggregation_format;
        method = this.deviceService.getDeviceSamplingTelemetry(obj, this.contextApp.app);
      }
    } else {
      if (!filterObj.aggregation_minutes || !filterObj.aggregation_format ) {
        this.toasterService.showError('Aggregation time and format is required.', 'View Telemetry');
        return;
      } else {
        delete obj.sampling_frequency_in_mins;
        delete obj.sampling_format;
        method = this.deviceService.getDeviceTelemetry(obj);
      }
    }
    } else {
      delete obj.aggregation_minutes;
      delete obj.aggregation_format;
      delete obj.sampling_frequency_in_mins;
      delete obj.sampling_format;
      method = this.deviceService.getDeviceTelemetry(obj);
    }
    this.isTelemetryLoading = true;
    this.isFilterSelected = true;
    this.subscriptions.push(method.subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetry = response.data;
          this.telemetry.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
          // this.telemetry.reverse();
        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.props = [];
    }
  }

  savePDF(): void {
    this.isFileDownloading = true;
    const pdf = new jsPDF('p', 'pt', 'A3');

    pdf.text(this.filterObj.report_type + ' for ' +
    (this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id) +
    ' for ' + this.commonService.convertEpochToDate(this.newFilterObj.from_date) + ' to ' +
    this.commonService.convertEpochToDate(this.newFilterObj.to_date), 20, 50);
    autoTable(pdf, { html: '#dataTable1', margin: { top: 70 } });
    const now = moment().utc().unix();
    pdf.save((this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id)
           + '_' + this.filterObj.report_type + '_' + now + '.pdf');
    this.isFileDownloading = false;
  }

  saveExcel() {
    this.isFileDownloading = true;
    let ws: XLSX.WorkSheet;
    let data = [];
    if (this.filterObj.report_type !== 'Process Parameter Report') {

      this.latestAlerts.forEach(alert => {
        data.push({
          'Asset Name': (this.deviceFilterObj.display_name ? this.deviceFilterObj.display_name : this.deviceFilterObj.device_id),
          Time: alert.local_created_date,
          Severity: alert.severity,
          Description: alert.message,
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
          'Asset Name': this.filterObj.non_ip_device ?
            (this.filterObj.non_ip_device.device_display_name ? this.filterObj.non_ip_device?.device_display_name
              : this.filterObj.non_ip_device?.device_id)
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

    }
    ws = XLSX.utils.json_to_sheet(data);

    console.log(ws);


    const colA = XLSX.utils.decode_col('B'); // timestamp is in first column

    const fmt = 'DD-MMM-YYYY hh:mm:ss.SSS'; // excel datetime format

    // get worksheet range
    const range = XLSX.utils.decode_range(ws['!ref']);
    console.log(range.s.r);
    console.log(range.e.r);
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
    console.log(ws);
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
    XLSX.writeFile(wb, (this.filterObj.device.display_name ? this.filterObj.device.display_name : this.filterObj.device.device_id)
      + '_' + this.filterObj.report_type + '_' + now + '.xlsx');
    this.isFileDownloading = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
