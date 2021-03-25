import { ToasterService } from './../../../services/toaster.service';
import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
@Component({
  selector: 'app-device-maintenance',
  templateUrl: './device-maintenance.component.html',
  styleUrls: ['./device-maintenance.component.css']
})
export class DeviceMaintenanceComponent implements OnInit, OnDestroy {

  maintenanceFilter: any = {};
  maintenanceData: any[] = [];
  @Input() device: Device = new Device();
  isMaintenanceDataLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedMaintenanceData: any;
  viewMaintenanceDataObj: any;
  deleteMaintenanceDataObj: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  maintenanceTableConfig: any = {};
  isCreateRecordAPILoading = false;
  @ViewChild('dt1', {static: false}) startDateInput: any;
  @ViewChild('dt2', {static: false}) endDateInput: any;
  isFileUploading = false;
  loggedInUser: any;
  contextApp: any;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private toasterService: ToasterService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.device?.tags?.category === CONSTANTS.IP_GATEWAY ) {
      this.maintenanceFilter.gateway_id = this.device.device_id;
    } else {
      this.maintenanceFilter.device_id = this.device.device_id;
    }
    this.apiSubscriptions.push(this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.maintenanceTableConfig = {
        type: 'maintenance',
        headers: ['Start Date', 'End Date', 'Title', 'Detail'],
        data: [
          {
            name: 'Start Date',
            key: 'local_start_date',
          },
          {
            name: 'End Date',
            key: 'local_end_date',
          },
          {
            name: 'Title',
            key: 'title',
          },
          {
            name: 'Data',
            key: undefined,
          }
        ]
      };
    }));
    this.maintenanceFilter.epoch = true;
    // this.searchMaintenance(this.maintenanceFilter);

  }

  searchMaintenance(filterObj) {
    console.log(filterObj);
    this.maintenanceFilter = JSON.parse(JSON.stringify(filterObj));
    this.isFilterSelected = true;
    this.isMaintenanceDataLoading = true;
    const obj = {...filterObj};
    const now = moment().utc();
    if (filterObj.dateOption === '5 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(5, 'minute')).unix();
    } else if (filterObj.dateOption === '30 mins') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(30, 'minute')).unix();
    } else if (filterObj.dateOption === '1 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(1, 'hour')).unix();
    } else if (filterObj.dateOption === '24 hour') {
      obj.to_date = now.unix();
      obj.from_date = (now.subtract(24, 'hour')).unix();
    } else {
      if (filterObj.from_date) {
        obj.from_date = (filterObj.from_date.unix());
      }
      if (filterObj.to_date) {
        obj.to_date = filterObj.to_date.unix();
      }
    }
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Device Maintenance Data');
      this.isMaintenanceDataLoading = false;
      this.isFilterSelected = false;
      return;
    }
    console.log(filterObj);
    delete obj.dateOption;
    this.maintenanceFilter = filterObj;
    this.apiSubscriptions.push(this.deviceService.getDeviceMaintenanceActivityData
      (this.contextApp.app, this.device.device_id, obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.maintenanceData = response.data;
          this.maintenanceData.forEach(item => {
            item.local_start_date = this.commonService.convertUTCDateToLocal(item.start_date);
            if (item.end_date) {
              item.local_end_date = this.commonService.convertUTCDateToLocal(item.end_date);
            }
          });
        }
        this.isMaintenanceDataLoading = false;
      }, error => this.isMaintenanceDataLoading = false
    ));
  }

  openMaintenanceMessageModal(obj) {
      this.viewMaintenanceDataObj = obj;
      this.viewMaintenanceDataObj.notes.forEach(note => note.local_time = this.commonService.convertUTCDateToLocal(note.time));
      // this.viewMaintenanceDataObj.notes.reverse();
      this.viewMaintenanceDataObj.documents.forEach(doc => doc.data.sanitizedURL = this.sanitizeURL(doc.data.url));
      $('#maintenanceMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  sanitizeURL(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + url + this.sasToken);
  }


  // tslint:disable-next-line: no-unnecessary-initializer
  openAddMaintenanceRecordModal(data = undefined) {
    if (data) {
      this.selectedMaintenanceData = JSON.parse(JSON.stringify(data));
      this.selectedMaintenanceData.notes = [{text: undefined}];
      this.selectedMaintenanceData.documents = [{}];
    } else {
      this.selectedMaintenanceData = {
        notes: [{text: undefined}],
        documents: [{}]
      };
    }
    $('#addMaintenanceRecordModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  openRemoveRecordModal(record) {
    this.deleteMaintenanceDataObj = record;
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseModal() {
    $('#addMaintenanceRecordModal').modal('hide');
    this.selectedMaintenanceData = undefined;
  }

  closeConfirmModal() {
    $('#confirmMessageModal').modal('hide');
    this.deleteMaintenanceDataObj = undefined;
  }

  addDocument() {
    let msg = '';
    this.selectedMaintenanceData.documents.forEach(file => {
      if (!file.type || !file?.data?.url || !file?.data?.name) {
        msg = 'Please select file.';
      }
    });
    if (msg) {
      this.toasterService.showError(msg, 'Add Maintenance Record');
      return;
    }
    this.selectedMaintenanceData.documents.push({
      type: undefined,
      data : {}
    });
   }

  async onDocumentFileSelected(files: FileList, index): Promise<void> {
    console.log(files);
    const arr = files?.item(0)?.name?.split('.') || [];
    if (!files?.item(0).type.includes(this.selectedMaintenanceData.documents[index].type?.toLowerCase())) {
      this.toasterService.showError('This file is not valid for selected document type', 'Select File');
      return;
    }

    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0),
    'devices/' + this.device.device_id + '/maintenance-records');
    if (data) {
      this.selectedMaintenanceData.documents[index].data = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }


  onRecordDateChange(event, type) {
    console.log(event);
    if (type === 'start') {
      this.selectedMaintenanceData.start_date = moment(event.value).utc().toISOString();
    } else {
      this.selectedMaintenanceData.end_date = moment(event.value).utc().toISOString();
    }
  }

  updateMaintenanceRecord() {
    const docs = [];
    this.selectedMaintenanceData.documents.forEach(doc => {
      if (doc.type && doc?.data?.url && doc?.data?.name) {
        docs.push(doc);
      }
    });
    const notes = [];
    const recordObj = this.maintenanceData.find(record => record.id === this.selectedMaintenanceData.id);
    recordObj.notes.reverse();
    recordObj.notes.forEach(note => {
      notes.splice(0, 0, note);
    });
    recordObj.notes = notes;
    this.selectedMaintenanceData.notes.forEach(note => {
      if (note.text) {
        note.time = moment().utc().toISOString();
        notes.splice(0, 0, note);
      }
    });
    if (docs.length > 0) {
      recordObj.documents.forEach(doc => {
        docs.splice(0, 0, doc);
      });
      recordObj.documents = docs;
    }
    recordObj.title = this.selectedMaintenanceData.title;
    recordObj.end_date = this.selectedMaintenanceData.end_date;
    delete recordObj.local_start_date;
    delete recordObj.local_end_date;
    this.selectedMaintenanceData = JSON.parse(JSON.stringify(recordObj));
    this.createMaintenanceRecord();
  }

  createMaintenanceRecord() {
    console.log(this.selectedMaintenanceData);
    if (!this.selectedMaintenanceData.start_date) {
      this.toasterService.showError('Start Date is compulsory', 'Add Maintenance Record');
      return;
    }
    if (!this.selectedMaintenanceData.id) {
    const arr = [];
    this.selectedMaintenanceData.documents.forEach(doc => {
      if (doc.type && doc?.data?.url && doc?.data?.name) {
        arr.push(doc);
      }
    });
    const notes = [];
    this.selectedMaintenanceData.notes.forEach(note => {
      if (note.text) {
        note.time = moment().utc().toISOString();
        notes.push(note);
      }
    });
    this.selectedMaintenanceData.documents = arr;
    this.selectedMaintenanceData.notes = notes;
    this.isCreateRecordAPILoading = true;
    this.selectedMaintenanceData.gateway_id = this.device.gateway_id;
    this.selectedMaintenanceData.created_by = this.loggedInUser.email;
    } else {
      this.selectedMaintenanceData.updated_by = this.loggedInUser.email;
    }
    const method = !this.selectedMaintenanceData.id ?
    this.deviceService.createDeviceMaintenanceActivityData(this.contextApp.app, this.device.device_id,
      this.selectedMaintenanceData) :
    this.deviceService.updateDeviceMaintenanceActivityData(this.contextApp.app, this.device.device_id,
      this.selectedMaintenanceData.id, this.selectedMaintenanceData);
    this.apiSubscriptions.push(method.subscribe(
        (response: any) => {
          this.isCreateRecordAPILoading = false;
          this.toasterService.showSuccess(response.message, ((this.selectedMaintenanceData.id ? 'Edit' : 'Add') + ' Maintenance Record'));
          this.onCloseModal();
          if (!this.maintenanceFilter.from_date || !this.maintenanceFilter.to_date) {
            this.maintenanceFilter.dateOption = '5 mins';
          }
          this.searchMaintenance(this.maintenanceFilter);
        }, error => {
          this.isCreateRecordAPILoading = false;
          this.toasterService.showError(error.message, ((this.selectedMaintenanceData.id ? 'Edit' : 'Add') + ' Maintenance Record'));
        }
      ));
  }

  onRemoveRecord() {
    this.apiSubscriptions.push(this.deviceService.deleteDeviceMaintenanceActivityData
      (this.contextApp.app, this.device.device_id, this.deleteMaintenanceDataObj.id)
    .subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Remove Maintenance Record');
        this.closeConfirmModal();
        this.searchMaintenance(this.maintenanceFilter);
      }, error => {
        this.toasterService.showError(error.message, 'Remove Maintenance Record');
      }
    ));
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#maintenanceMessageModal').modal('hide');
      this.viewMaintenanceDataObj = undefined;
    }
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }
}
