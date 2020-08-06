import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-device-control-panel',
  templateUrl: './device-control-panel.component.html',
  styleUrls: ['./device-control-panel.component.css']
})
export class DeviceControlPanelComponent implements OnInit {

  activeTab: string;
  device: Device = new Device;
  isDeviceDataLoading = false;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private deviceService: DeviceService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      params => {
        if (params.get('deviceId')) {
          this.device.device_id = params.get('deviceId');
          this.getDeviceDetail();
        }
      }
    );
    this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          this.activeTab = 'overview';
        }
      }
    )
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  onSidebarToggle() {
    console.log(this.document.body.classList.length);
    if (!this.document.body.classList.contains('sidebar-toggled')) {
      this.document.body.classList.add('sidebar-toggled');
    } else {
      this.document.body.classList.remove('sidebar-toggled');
    }
    const elem = this.document.getElementById('controlPanelSidebar');
    if (!elem.classList.contains('toggled')) {
      elem.classList.add('toggled');
    } else {
      elem.classList.remove('toggled');
    }
  }

  getDeviceDetail() {
    this.isDeviceDataLoading = true;
    this.deviceService.getDeviceData(this.device.device_id).subscribe(
      (response: any) => {
        this.device = response;
        this.isDeviceDataLoading = false;
      }, () => this.isDeviceDataLoading = false
    )
  }

}
