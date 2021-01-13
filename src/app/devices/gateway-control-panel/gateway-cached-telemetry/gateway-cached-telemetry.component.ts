import { DomSanitizer } from '@angular/platform-browser';
import { Device } from './../../../models/device.model';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { environment } from 'src/environments/environment';
import { FileSaverService } from 'ngx-filesaver';
import { JsonEditorOptions } from 'ang-jsoneditor';

declare var $: any;
@Component({
  selector: 'app-gateway-cached-telemetry',
  templateUrl: './gateway-cached-telemetry.component.html',
  styleUrls: ['./gateway-cached-telemetry.component.css']
})
export class GatewayCachedTelemetryComponent implements OnInit, OnDestroy {

  filterObj: any = {};
  telemetryList: any[] = [];
  @Input() device: Device = new Device();
  isTelemetryLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedTelemetry: any;
  isFilterSelected = false;
  modalConfig: any;
  pageType: string;
  telemetryTableConfig: any = {};
  sasToken = environment.blobKey;
  fileData: any;
  isFileDataLoading: boolean;
  editorOptions: JsonEditorOptions;
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private fileSaverService: FileSaverService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.filterObj.gateway_id = this.device.device_id;

    this.route.paramMap.subscribe(params => {
      this.pageType = params.get('listName');
      this.pageType = this.pageType.slice(0, -1);
      this.telemetryTableConfig = {
        type: 'cached telemetry',
        data: [
          {
            name: 'Uploaded At',
            key: 'local_upload_date',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Processed At',
            key: 'local_created_date',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Asset',
            key: 'device_id',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'File',
            key: 'file_name',
            type: 'text',
            headerClass: '',
            valueclass: ''
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            headerClass: '',
            btnData: [
              {
                icon: 'fa fa-fw fa-download',
                text: '',
                id: 'Download',
                valueclass: '',
                tooltip: 'Download'
              },
              {
                icon: 'fa fa-fw fa-eye',
                text: '',
                id: 'View Document',
                valueclass: '',
                tooltip: 'View Document'
              }
            ]
          }
        ]
      };

    });
    this.filterObj.epoch = true;

  }

  searchTelemetry(filterObj) {
    console.log(filterObj);
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
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
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.apiSubscriptions.push(this.deviceService.getGatewayCachedTelemetry(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetryList = response.data;
          this.telemetryList.forEach(item => {
            item.local_created_date = this.commonService.convertSignalRUTCDateToLocal(item.created_date);
            item.local_upload_date = this.commonService.convertSignalRUTCDateToLocal(item.upload_date);
            console.log(item);
          });
        }
        this.isTelemetryLoading = false;
      }, error => this.isTelemetryLoading = false
    ));
  }

  downloadFile(fileObj, type) {
    // const link = document.createElement('a');
    // link.setAttribute('target', '_blank');
    // link.setAttribute('href', fileObj.url + this.sasToken);
    // link.setAttribute('download', fileObj.name);
    // document.body.appendChild(link);
    // link.click();
    return new Promise((resolve) => {
      this.isFileDataLoading = true;
    // link.remove();
      this.fileData = undefined;
      const url = environment.blobURL + '/' + environment.cachedTelemetryContainer + '/' +
      fileObj.file_path + '/' + fileObj.file_name + this.sasToken;
      let method;
      if (type === 'download') {
        method = this.commonService.getFileData(url);
      } else  {
        method = this.commonService.getFileOriginalData(url);
      }
      this.apiSubscriptions.push(method.subscribe(
        response => {
          this.fileData = response;
          console.log(this.fileData);
          if (type === 'download') {
          this.fileSaverService.save(response, fileObj.file_name);
          }
          this.isFileDataLoading = false;
          resolve();
        }, error => this.isFileDataLoading = false
      ));
    });
  }


  async openTelemetryMessageModal(obj) {
    if (obj.for === 'Download') {
      this.downloadFile(obj.data, 'download');
    } else if (obj.for === 'View Document') {
      this.selectedTelemetry = obj.data;
      this.modalConfig = {
        jsonDisplay: true,
        isDisplaySave: false,
        isDisplayCancel: true
      };
      $('#telemetryMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
      await this.downloadFile(obj.data, 'view');

    }
  }


  onModalEvents(eventType) {
    if (eventType === 'close') {
      $('#telemetryMessageModal').modal('hide');
      this.selectedTelemetry = undefined;
    }
  }

  sanitizeURL() {
    const url = environment.blobURL + '/' + environment.cachedTelemetryContainer + '/'
    + this.selectedTelemetry.file_path + '/' + this.selectedTelemetry.file_name + this.sasToken;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }



  ngOnDestroy() {
    this.apiSubscriptions.forEach(subscribe => subscribe.unsubscribe());
  }

}
