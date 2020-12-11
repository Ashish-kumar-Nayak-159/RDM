import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { ToasterService } from './../../services/toaster.service';
import { DeviceService } from './../../services/devices/device.service';
import { ApplicationService } from './../../services/application/application.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from './../../services/common.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import { drawDOM, exportPDF } from '@progress/kendo-drawing';
import { saveAs } from '@progress/kendo-file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

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
      this.deviceService.getAllDevicesList(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
          }
          resolve();
        }
      );
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
      hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    await this.getDevices(hierarchyObj);

  }

  onAssetSelection() {
    // this.nonIPDevices = [];
    // this.filterObj.device_id = this.filterObj.device.device_id;
    const device_type = this.filterObj.device.device_type;
    if (device_type) {
      this.getThingsModelProperties(device_type);
    }
  }

  onNonIPDeviceChange() {
    // this.filterObj.device_id = this.filterObj.device.device_id;
    if (this.filterObj.report_type === 'Telemetry Report') {
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
  }

  onDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value[0]).second(0).utc();
    this.filterObj.to_date = moment(event.value[1]).second(0).utc();
    console.log(this.filterObj.from_date.unix());
    console.log(this.filterObj.to_date.unix());
  }

  onSingleDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = (moment(event.value).add(1, 'days')).utc();
    console.log(this.filterObj.from_date.unix());
    console.log(this.filterObj.to_date.unix());
    console.log(this.commonService.convertEpochToDate(this.filterObj.from_date.unix()));
    console.log(this.commonService.convertEpochToDate(this.filterObj.to_date.unix()));
  }

  getThingsModelProperties(deviceType) {
    return new Promise((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: deviceType
      };
      this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
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
      );
    });
  }

  onFilterSelection() {

    const obj = {...this.filterObj};
    let device_type: any;
    if (obj.device) {
      obj.device_id = obj.device.device_id;
      device_type = obj.device.device_type;
      delete obj.device;
    }
    if (!obj.report_type) {
      this.toasterService.showError('Report selection is required', 'View Report');
      return;
    }
    if (!obj.device_id) {
      this.toasterService.showError('Device selection is required', 'View Report');
      return;
    }

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
    if (obj.report_type === 'Telemetry Report') {
      this.getTelemetryData(obj);
    } else if (obj.report_type === 'Alert Report') {
      this.getAlertData(obj);
    }
  }

  getAlertData(obj) {
    this.deviceService.getDeviceAlerts(obj).subscribe(
      (response: any) => {
        this.latestAlerts = response.data;
        this.latestAlerts.reverse();
        this.latestAlerts.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    );
  }

  async getTelemetryData(obj) {
    delete obj.dateOption;
    let message_props = '';
    this.props.forEach((prop, index) => message_props = message_props + prop.value.json_key + (this.props[index + 1] ? ',' : ''));
    obj['message_props'] = message_props;
    this.deviceService.getDeviceTelemetryForReport(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetry = response.data;
          this.telemetry.forEach(item => item.local_created_date = this.commonService.convertUTCDateToLocal(item.message_date));

        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    );
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.props = [];
    }
  }

  savePDF(): void {
    const pdf = new jsPDF('p', 'pt', 'A3');

    pdf.text(this.filterObj.report_type + ' for ' +
    (this.filterObj.device.display_name ? this.filterObj.device.display_name : this.filterObj.device.device_id) +
    ' for ' + this.commonService.convertEpochToDate(this.newFilterObj.from_date) + ' to ' +
    this.commonService.convertEpochToDate(this.newFilterObj.to_date), 20, 50);
    autoTable(pdf, { html: '#dataTable', margin: { top: 70 } });
    const now = moment().utc().unix();
    pdf.save((this.filterObj.device.display_name ? this.filterObj.device.display_name : this.filterObj.device.device_id)
           + '_' + this.filterObj.report_type + '_' + now + '.pdf');
  }

  saveExcel() {
    const element = document.getElementById('dataTable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    let colA;
    if (this.filterObj.report_type === 'Alert Report') {
      colA = XLSX.utils.decode_col('C'); // timestamp is in first column
    } else if (this.filterObj.report_type === 'Telemetry Report') {
      colA = XLSX.utils.decode_col('B'); // timestamp is in first column
    }
    const fmt = 'DD-MMM-YYYY hh:mm:ss'; // excel datetime format

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
      { wch: 20 }
    ];

    ws['!cols'] = wscols;

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const now = moment().utc().unix();
    /* save to file */
    XLSX.writeFile(wb, (this.filterObj.device.display_name ? this.filterObj.device.display_name : this.filterObj.device.device_id)
      + '_' + this.filterObj.report_type + '_' + now + '.xlsx');
  }

}
