import { ToasterService } from './../../../services/toaster.service';
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
  devices: any[] = [];
  constructor(
    private deviceService: DeviceService,
    private commonService: CommonService,
    private fileSaverService: FileSaverService,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.statusBar = false;
    this.filterObj.gateway_id = this.device.device_id;
    this.devices = this.commonService.getItemFromLocalStorage(CONSTANTS.DEVICES_LIST);
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
          key: 'display_name',
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
      ],
      rowHighlight: {
        param: 'process_status',
        value: 'Success'
      }
    };
    this.filterObj.epoch = true;

  }

  searchTelemetry(filterObj) {
    this.isFilterSelected = true;
    this.isTelemetryLoading = true;
    const obj = {...filterObj};

    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'Get Cached Telemetry');
      this.isTelemetryLoading = false;
      this.isFilterSelected = false;
      return;
    }
    delete obj.dateOption;
    this.filterObj = filterObj;
    this.apiSubscriptions.push(this.deviceService.getGatewayCachedTelemetry(obj).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.telemetryList = response.data;
          this.telemetryList.forEach(item => {
            item.local_created_date = this.commonService.convertUTCDateToLocal(item.created_date);
            item.local_upload_date = this.commonService.convertUTCDateToLocal(item.upload_date);
            if (this.devices?.length > 0 && item.device) {
              const deviceObj = this.devices.find(device => device.device_id === item.device_id)
              item.display_name = deviceObj?.display_name || item.device_id;
            } else {
              item.display_name = item.device_id;
            }
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
    return new Promise<void>((resolve) => {
      this.isFileDataLoading = true;
    // link.remove();
      this.fileData = undefined;
      const url = environment.blobURL + environment.cachedTelemetryContainer + '/' +
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
