import { FileSaverService } from 'ngx-filesaver';
import { ToasterService } from './../../services/toaster.service';
import { DeviceService } from './../../services/devices/device.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-pre-generated-reports',
  templateUrl: './pre-generated-reports.component.html',
  styleUrls: ['./pre-generated-reports.component.css']
})
export class PreGeneratedReportsComponent implements OnInit {

  userData: any;
  filterObj: any = {};
  previousFilterObj: any = {};
  contextApp: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  devices: any[] = [];
  originalDevices: any[] = [];
  tileData: any;
  subscriptions: Subscription[] = [];
  isFilterOpen = true;
  today = new Date();
  isFilterSelected = false;
  reports: any[] = [];
  isReportDataLoading = false;
  @ViewChild('dtInput1', {static: false}) dtInput1: any;
  @ViewChild('dtInput2', {static: false}) dtInput2: any;
  blobStorageURL = environment.blobURL;
  sasToken = environment.blobKey;
  insideScrollFunFlag = false;
  currentOffset = 0;
  currentLimit = 20;

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService
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
              url: 'applications/' + this.contextApp.app + '/reports'
            }
        ]
      });

     // this.getLatestAlerts();
      await this.getDevices(this.contextApp.user.hierarchy);
      setTimeout(() => {
        $('#table-wrapper').on('scroll', () => {
          const element = document.getElementById('table-wrapper');
          if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0))
          >= parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
            this.currentOffset += this.currentLimit;
            this.getReportsData();
            this.insideScrollFunFlag = true;
          }
        });
      }, 2000);
     // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
    }));
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
    this.filterObj.hierarchy = JSON.parse(JSON.stringify(hierarchyObj));
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
    this.filterObj.deviceArr = undefined;
    this.filterObj.devices = undefined;
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
    this.filterObj.devices = undefined;
    this.filterObj.deviceArr = undefined;
  }

  onAssetSelection() {
    if (this.filterObj?.deviceArr.length > 0) {
      this.filterObj.devices = '';
      this.filterObj.deviceArr.forEach(device => {
        this.filterObj.devices += (this.filterObj.devices.length > 0 ? ',' : '') + device.device_id;
      });
    } else {
      this.filterObj.devices = undefined;
      this.filterObj.deviceArr = undefined;
    }
    // this.nonIPDevices = [];
    // this.filterObj.device_id = this.filterObj.device.device_id;
  }

  onAllAssetSelection() {
    if (this.filterObj?.deviceArr.length > 0) {
      this.filterObj.devices = '';
      this.filterObj.deviceArr.forEach(device => {
        this.filterObj.devices += (this.filterObj.devices.length > 0 ? ',' : '') + device.device_id;
      });
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
  }

  onDateChange(event) {
    this.filterObj.from_date = moment(event.value[0]).utc();
    this.filterObj.to_date = ((((moment(event.value[1])).add(23, 'hours')).add(59, 'minute')).add(59, 'second')).utc();
    const from = this.filterObj.from_date.unix();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
    if (this.dtInput2) {
      this.dtInput2.value = null;
    }
    if (this.filterObj.dateOption !== 'date range') {
      this.filterObj.dateOption = undefined;
    }
  }

  onSingleDateChange(event) {
    this.filterObj.from_date = moment(event.value).utc();
    this.filterObj.to_date = (((moment(event.value).add(23, 'hours')).add(59, 'minute')).add(59, 'second')).utc();
    if (this.dtInput1) {
      this.dtInput1.value = null;
    }
    if (this.filterObj.dateOption !== 'date') {
      this.filterObj.dateOption = undefined;
    }
    const from = this.filterObj.from_date.unix();
    const to = this.filterObj.to_date.unix();
    const current = (moment().utc()).unix();
    if (current < to) {
      this.filterObj.to_date = moment().utc();
    }
  }

  getReportsData() {
    this.insideScrollFunFlag = true;
    const obj = {...this.filterObj};
    if (!obj.report_type) {
      this.toasterService.showError('Report Type selection is required', 'View Report');
      return;
    }
    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0))
        >= parseFloat(element.scrollHeight.toFixed(0)) && !this.insideScrollFunFlag) {
          this.currentOffset += this.currentLimit;
          this.getReportsData();
          this.insideScrollFunFlag = true;
        }
      });
    }, 2000);
    if (this.filterObj.from_date) {
      obj.from_date = (this.filterObj.from_date.unix());
    }
    if (this.filterObj.to_date) {
      obj.to_date = this.filterObj.to_date.unix();
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Report');
      return;
    }
    if (obj.report_type.toLowerCase().includes('daily')) {
      obj.frequency = 'daily';
    } else {
      obj.frequency = 'weekly';
    }
    if (!obj.hierarchy) {
      obj.hierarchy =  { App: this.contextApp.app};
    }
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    this.isFilterSelected = true;
    delete obj.deviceArr;
    delete obj.dateOption;
    delete obj.report_type;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    this.isReportDataLoading = true;
    this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    // this.reports = [];
    this.subscriptions.push(this.deviceService.getPregeneratedReports(obj, this.contextApp.app).subscribe(
      (response: any) => {
        if (response.data?.length > 0) {
          // this.reports = response.data;
          response.data.forEach(report => {
            report.local_start_date = this.commonService.convertUTCDateToLocal(report.report_start_date);
            report.local_end_date = this.commonService.convertUTCDateToLocal(report.report_end_date);
          });
          this.reports = [...this.reports, ...response.data];
          if (response.data.length === this.currentLimit) {
            this.insideScrollFunFlag = false;
          } else {
            this.insideScrollFunFlag = true;
          }
        }
        this.isReportDataLoading = false;
      }, error => this.isReportDataLoading = false
    )
    );
  }

  getDeviceNameById(deviceId) {
    const device = this.originalDevices.find(deviceObj => deviceObj.device_id === deviceId);
    return (device?.display_name ? device.display_name : deviceId);
  }

  downloadFile(reportObj) {
    $('#downloadPreGeneratedReportReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    setTimeout(() => {
      const url = this.blobStorageURL + reportObj.report_url + this.sasToken;
      this.subscriptions.push(this.commonService.getFileData(url).subscribe(
        response => {
          this.fileSaverService.save(response, reportObj.report_file_name);
          $('#downloadPreGeneratedReportReportModal').modal('hide');
        }, error => {
          $('#downloadPreGeneratedReportReportModal').modal('hide');
        }
      ));
    }, 1000);
  }


}
