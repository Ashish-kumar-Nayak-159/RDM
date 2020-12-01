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


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  userData: any;
  appName: string;
  applicationData: any;
  filterObj: any = {};
  appData: any;
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
    this.route.paramMap.subscribe(async params => {
      if (params.get('applicationId')) {
        this.appName = params.get('applicationId');
        this.applicationData = this.userData.apps.filter(
          app => app.app === params.get('applicationId')
        )[0];
        await this.getApplicationData();
        this.filterObj.app = this.appData.app;
       // this.filterObj.count = 10;
      }
      this.commonService.breadcrumbEvent.emit({
        type: 'replace',
        data: [
          {
            title: this.appData.user.hierarchyString,
            url: 'applications/' + this.appData.app
          },
            {
              title: 'Visualization',
              url: 'applications/' + this.appData.app + '/visualization'
            }
        ]
      });
     // this.getLatestAlerts();
      await this.getDevices(this.appData.user.hierarchy);
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
    });

  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.appData = response;
            this.appData.user = this.applicationData.user;
            if (this.appData.hierarchy.levels.length > 1) {
              this.hierarchyArr[1] = Object.keys(this.appData.hierarchy.tags);
            }
            this.appData.hierarchy.levels.forEach((level, index) => {
              if (index !== 0) {
                this.configureHierarchy[index] = this.appData.user.hierarchy[level];
                if (this.appData.user.hierarchy[level]) {
                  this.onChangeOfHierarchy(index);
                }
              }
            });
            resolve();
        });
    });
  }

  getDevices(hierarchy) {
    return new Promise((resolve) => {
      const obj = {
        app: this.appData.app,
        hierarchy: JSON.stringify(hierarchy),
      };
      this.deviceService.getDeviceList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
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
    let nextHierarchy = this.appData.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};
    const hierarchyObj: any = { App: this.applicationData.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      hierarchyObj[this.appData.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    await this.getDevices(hierarchyObj);

  }

  onAssetSelection() {
    this.nonIPDevices = [];
    const hierarchyObj: any = { App: this.applicationData.app};
    Object.keys(this.configureHierarchy).forEach((key) => {
      hierarchyObj[this.appData.hierarchy.levels[key]] = this.configureHierarchy[key];
      console.log(hierarchyObj);
    });
    // this.filterObj.device_id = this.filterObj.device.device_id;
    const device_type = this.filterObj.device.device_type;
    if (device_type) {
      this.getThingsModelProperties(device_type);
    }
    if (this.filterObj.device?.cloud_connectivity.includes('Gateway')) {
      const obj: any = {
        app: this.appData.app,
        hierarchy: JSON.stringify(hierarchyObj),
        gateway_id: this.filterObj.device.device_id
      };
      obj.hierarchy = { App: this.applicationData.app};
      Object.keys(this.configureHierarchy).forEach((key) => {
        obj.hierarchy[this.appData.hierarchy.levels[key]] = this.configureHierarchy[key];
        console.log(obj.hierarchy);
      });
      obj.hierarchy = JSON.stringify(obj.hierarchy);
      this.deviceService.getNonIPDeviceList(obj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.nonIPDevices = response.data;
          }
        }
      );
    }
  }

  onNonIPDeviceChange() {
    // this.filterObj.device_id = this.filterObj.device.device_id;
    if (this.filterObj.report_type === 'Telemetry Report') {
    if (this.filterObj.non_ip_device) {
    const device_type = this.filterObj.non_ip_device.device_type;
    if (device_type) {
      this.getThingsModelProperties(device_type);
    }
    } else if (this.filterObj.device) {
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
    this.filterObj.from_date = moment(event.value[0]).utc();
    this.filterObj.to_date = moment(event.value[1]).utc();
  }

  onSingleDateChange(event) {
    console.log(event);
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = (moment(event.value).add(1, 'days')).utc();
    console.log(this.filterObj.from_date.unix());
    console.log(this.filterObj.to_date.unix());
  }

  getThingsModelProperties(deviceType) {
    return new Promise((resolve) => {
      const obj = {
        app: this.appData.app,
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
    if (obj.non_ip_device) {
      obj.gateway_id = obj.device.device_id;
      obj.device_id = obj.non_ip_device.device_id;
      device_type = obj.non_ip_device.device_type;
      delete obj.device;
      delete obj.non_ip_device;
    } else if (obj.device) {
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
    this.deviceService.getDeviceTelemetry(obj).subscribe(
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
    const drawDOMFn = drawDOM(document.getElementById('dataTable'), this.pdfOptions);
    drawDOMFn.catch( (error) => {
      console.log(error);
    });
    const exportPDFFn = drawDOMFn.then((group) => {
        // Render the result as a PDF file
        return exportPDF(group);
    });
    exportPDFFn.then((dataObj) => {
        // Save the PDF file
        const now = moment().utc().unix();
        saveAs(
          dataObj,
          (this.filterObj.non_ip_device ? this.filterObj.non_ip_device.device_id : this.filterObj.device.device_id)
           + '_' + this.filterObj.report_type + '_' + now + '.pdf'
        );
    });
    exportPDFFn.catch ( (error) => {
      console.log(error);
    });
  }

  saveExcel() {
    const element = document.getElementById('dataTable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const now = moment().utc().unix();
    /* save to file */
    XLSX.writeFile(wb, (this.filterObj.non_ip_device ? this.filterObj.non_ip_device.device_id : this.filterObj.device.device_id)
      + '_' + this.filterObj.report_type + '_' + now + '.xlsx');
  }

}
