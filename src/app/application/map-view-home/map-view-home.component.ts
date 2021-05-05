import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-map-view-home',
  templateUrl: './map-view-home.component.html',
  styleUrls: ['./map-view-home.component.css']
})
export class MapViewHomeComponent implements OnInit, OnDestroy {

  centerLatitude: any;
  centerLongitude: any;
  devices: any[] = [];
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  constantData = CONSTANTS;
  constructor(
    private deviceService: DeviceService,
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAllDevices();
  }


  getAllDevices() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy)
      };
      this.apiSubscriptions.push(this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            const center = this.commonService.averageGeolocation(this.devices);
            this.centerLatitude = center?.latitude || 23.0225;
            this.centerLongitude = center?.longitude || 72.5714;
          }
          resolve();
        }
      ));
    });
  }
  onMarkerClick(infowindow, gm) {
    if (gm.lastOpen != null) {
      gm.lastOpen.close();
    }
    gm.lastOpen = infowindow;
    infowindow.open();
  }

  onMarkerMouseOut(infowindow, gm) {
    gm.lastOpen = null;
    infowindow.close();
  }

  redirectToDevice(device) {
    if (device.type === CONSTANTS.NON_IP_DEVICE) {
      this.router.navigate(['applications', this.contextApp.app,
    'nonIPDevices',
    device.device_id, 'control-panel']);
    } else if (device.type === CONSTANTS.IP_DEVICE) {
      this.router.navigate(['applications', this.contextApp.app,
    'devices',
    device.device_id, 'control-panel']);
    } else if (device.type === CONSTANTS.IP_GATEWAY) {
      this.router.navigate(['applications', this.contextApp.app,
    'gateways',
    device.device_id, 'control-panel']);
    }

  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(su => su.unsubscribe());
  }


}
