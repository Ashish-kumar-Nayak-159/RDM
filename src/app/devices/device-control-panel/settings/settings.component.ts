import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { DeviceService } from './../../../services/devices/device.service';
import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

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
  constructor(
    private deviceService: DeviceService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
  }

  enableDevice() {
    this.isAPILoading = true;
    this.deviceService.enableDevice(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.toasterService.showSuccess('Device Enabled Successfully', 'Enable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError('Error in enabling device', 'Enable Device');
        this.isAPILoading = false;
      }
    );
  }

  disableDevice() {
    this.isAPILoading = true;
    this.deviceService.disableDevice(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.toasterService.showSuccess('Device disabled Successfully', 'Disable Device');
        this.isAPILoading = false;
        this.deviceService.reloadDeviceInControlPanelEmitter.emit();
      }, error => {
        this.toasterService.showError('Error in disabling device', 'Disable Device');
        this.isAPILoading = false;
      }
    );
  }

  deleteDevice() {
    this.isAPILoading = true;
    this.deviceService.deleteDevice(this.device.device_id, this.userData.app).subscribe(
      response => {
        this.toasterService.showSuccess('Device deleted Successfully', 'Delete Device');
        this.isAPILoading = false;
        this.router.navigate(['applications', this.userData.app, 'devices']);
      }, error => {
        this.toasterService.showError('Error in deleting device', 'Delete Device');
        this.isAPILoading = false;
      }
    );
  }

}
