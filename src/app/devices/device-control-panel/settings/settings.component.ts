import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { DeviceService } from './../../../services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  @Input() device = new Device();
  apiSubscriptions: Subscription[] = [];
  isAPILoading = false;
  userData: any;
  modalConfig: any;
  btnClickType: string;
  confirmModalMessage: string;
  constructor(
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  enableDevice() {
    this.isAPILoading = true;
    this.deviceService.enableDevice(this.device.device_id, this.userData.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Enable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Enable Device');
        this.isAPILoading = false;
      }
    );
  }

  openConfirmDialog(type) {
    this.btnClickType = type;
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true
    };
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    console.log(eventType);
    if (eventType === 'save'){
      console.log(this.btnClickType);
      if (this.btnClickType === 'Disable') {
        this.disableDevice();
        this.btnClickType = undefined;
      } else if (this.btnClickType === 'Delete') {
        this.deleteDevice();
        this.btnClickType = undefined;
      }
    }
    $('#confirmMessageModal').modal('hide');
  }

  disableDevice() {
    this.isAPILoading = true;
    this.deviceService.disableDevice(this.device.device_id, this.userData.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Disable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError(error.message, 'Disable Device');
        this.isAPILoading = false;
      }
    );
  }

  deleteDevice() {
    this.isAPILoading = true;
    this.deviceService.deleteDevice(this.device.device_id, this.userData.app).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Delete Device');
        this.isAPILoading = false;
        this.router.navigate(['applications', this.userData.app, 'devices']);
      }, error => {
        this.toasterService.showError(error.message, 'Delete Device');
        this.isAPILoading = false;
      }
    );
  }

}
