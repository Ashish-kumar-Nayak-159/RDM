import { environment } from './../../../environments/environment';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-map-view-home',
  templateUrl: './map-view-home.component.html',
  styleUrls: ['./map-view-home.component.css']
})
export class MapViewHomeComponent implements OnInit, OnDestroy {

  userData: any;
  centerLatitude: any;
  centerLongitude: any;
  devices: any[] = [];
  originalDevices: any[] = [];
  mapDevices: any[] = [];
  contextApp: any;
  apiSubscriptions: Subscription[] = [];
  constantData = CONSTANTS;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  filterObj: any = {};
  hierarchyString: any;
  displayHierarchyString: any;
  derivedKPILatestData: any[] = [];
  healthyDeviceCount = 0;
  unhealthyDeviceCount = 0;
  environmentApp = environment.app;
  activeCircle = 'all';
  mapFitBounds = false;
  zoom = undefined;
  customMapStyle =  [
    {
      featureType: 'poi',
      stylers: [
        { visibility: 'off' }
      ]
    },
    {
      featureType: 'transit',
      stylers: [
        { visibility: 'off' }
      ]
    },
   {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    }
  ];

  constructor(
    private deviceService: DeviceService,
    private router: Router,
    private commonService: CommonService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp.app === 'CMS_Dev') {
      await this.getLatestDerivedKPIData();
    }
    await this.getAllDevices();

    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    console.log(item);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (item) {
      this.loadFromCache(item);
    } else {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        if (this.contextApp.user.hierarchy[level]) {
          this.onChangeOfHierarchy(index, false);
        }
        }
      });
      this.onDeviceFilterApply();
    }
  }

  loadFromCache(item) {
      // this.originalFilter = JSON.parse(JSON.stringify(item));
      // this.filterObj = JSON.parse(JSON.stringify(item));
    if (item.hierarchy) {
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
        this.configureHierarchy[index] = item.hierarchy[level];
        console.log(this.configureHierarchy);
        if (item.hierarchy[level]) {
          this.onChangeOfHierarchy(index, true, false);
        }
        }
      });
      }
      this.onDeviceFilterApply(false);
    }

  }



  getAllDevices() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
        type: this.contextApp.app === 'CMS_Dev' ? CONSTANTS.NON_IP_DEVICE : undefined
      };
      if (this.contextApp.app === 'CMS_Dev') {
      this.healthyDeviceCount = 0;
      this.unhealthyDeviceCount = 0;
      }
      this.apiSubscriptions.push(this.deviceService.getLegacyDevices(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response?.data) {
            this.devices = response.data;
            this.mapDevices = JSON.parse(JSON.stringify(this.devices));
            this.devices.forEach(device => {
              if (this.environmentApp === 'KCMS') {
                device.mttr = '7 Mins';
                device.mtbf = '2 days 5 hours';
                device.gas = '0.4%';
                device.power = '45 SCMH';
              }
              if (this.contextApp.app === 'CMS_Dev') {
                this.derivedKPILatestData.forEach(kpiObj => {
                  if (device.device_id === kpiObj.device_id) {
                    device.kpiValue = kpiObj?.metadata?.healthy;
                    device.spcd = kpiObj?.metadata?.specific_power_consumption_discharge;
                    console.log(kpiObj?.metadata?.healthy);
                    if (kpiObj?.metadata?.healthy === true) {
                      this.healthyDeviceCount++;
                      console.log('healthy');
                    } else if (kpiObj?.metadata?.healthy === false){
                      this.unhealthyDeviceCount++;
                      console.log('unhealthy');
                    }
                  }
                });
                if (device.type === this.constantData.NON_IP_DEVICE) {
                  device.icon = {
                    url: device.kpiValue === true ? './assets/img/legacy-asset-green.svg' : (device.kpiValue === false ? './assets/img/legacy-asset-red.svg' : './assets/img/legacy-assets.svg'),
                    scaledSize: {
                      width: 25,
                      height: 25
                    }};
                }
              } else {
                if (device.type === this.constantData.IP_DEVICE && device?.configuration?.connection_state?.toLowerCase() === 'connected') {
                  device.icon = {
                    url: './assets/img/iot-assets-green.svg',
                    scaledSize: {
                      width: 35,
                      height: 35
                    }};
                } else if (device.type === this.constantData.IP_DEVICE && device?.configuration?.connection_state?.toLowerCase() === 'disconnected') {
                  device.icon = {
                    url: './assets/img/iot-assets-red.svg',
                    scaledSize: {
                      width: 35,
                      height: 35
                    }};
                } else if (device.type === this.constantData.IP_GATEWAY && device?.configuration?.connection_state?.toLowerCase() === 'connected') {
                  device.icon = {
                    url: './assets/img/iot-gateways-green.svg',
                    scaledSize: {
                      width: 30,
                      height: 30
                    }};
                } else if (device.type === this.constantData.IP_GATEWAY && device?.configuration?.connection_state?.toLowerCase() === 'disconnected') {
                  device.icon = {
                    url: './assets/img/iot-gateways-red.svg',
                    scaledSize: {
                      width: 30,
                      height: 30
                    }};
                } else if (device.type === this.constantData.NON_IP_DEVICE) {
                  device.icon = {
                    url: './assets/img/legacy-assets.svg',
                    scaledSize: {
                      width: 25,
                      height: 25
                    }};
                }
              }
            });
            this.originalDevices = JSON.parse(JSON.stringify(this.devices));
            const center = this.commonService.averageGeolocation(this.devices);
            this.centerLatitude = center?.latitude || 23.0225;
            this.centerLongitude = center?.longitude || 72.5714;
          }
          resolve();
        }
      ));
    });
  }

  async onChangeOfHierarchy(i, flag, persistDeviceSelection = true) {
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

    if (flag) {
      const hierarchyObj: any = { App: this.contextApp.app};

      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {

          hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      if (Object.keys(hierarchyObj).length === 1) {
        this.devices = JSON.parse(JSON.stringify(this.originalDevices));
      } else {
      const arr = [];
      this.devices = [];
      this.originalDevices.forEach(device => {
        let flag1 = false;
        Object.keys(hierarchyObj).forEach(hierarchyKey => {
          if (device.hierarchy[hierarchyKey] && device.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
            flag1 = true;
          } else {
            flag1 = false;
          }
        });
        if (flag1) {
          arr.push(device);
        }
      });
      this.devices = JSON.parse(JSON.stringify(arr));
      }
      if (this.devices?.length === 1) {
        this.filterObj.device = this.devices[0];
      }
      if (persistDeviceSelection) {
      this.filterObj.deviceArr = undefined;
      this.filterObj.device = undefined;
      }
      // await this.getDevices(hierarchyObj);
    }
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

  getLatestDerivedKPIData() {
    return new Promise<void>((resolve) => {
      const derivedKPICode = 'SPCD';
      const obj = {
        from_date: moment().subtract(24, 'hours').utc().unix(),
        to_date: moment().utc().unix(),
        epoch: true,
        asset_model: 'Hydraulic Booster Compressor 1.2'
      };
      this.apiSubscriptions.push(this.deviceService.getDerivedKPILatestData(this.contextApp.app, derivedKPICode, obj)
      .subscribe((response: any) => {
        if (response?.data) {
          this.derivedKPILatestData = response.data;
        }
        resolve();
      })
      );
    });
  }

  onClickOfCount(type) {
    const arr = [];
    this.activeCircle = type;
    if (type !== 'all') {
    this.devices.forEach(device => {
      console.log(device.kpiValue === false);
      if (type === 'healthy' && device.kpiValue === true) {
        arr.push(device);
      }
      if (type === 'unhealthy' && device.kpiValue === false) {
        arr.push(device);
      }
    });

    this.mapDevices = JSON.parse(JSON.stringify(arr));
    } else {
      this.mapDevices = JSON.parse(JSON.stringify(this.devices));
    }
    if (this.mapDevices.length === 0) {
      this.mapFitBounds = false;
      const center = this.commonService.averageGeolocation(this.mapDevices);
      this.centerLatitude = center?.latitude || 23.0225;
      this.centerLongitude = center?.longitude || 72.5714;
      // this.zoom = 5;
    } else {
      this.mapFitBounds = true;
      // this.zoom = undefined;
    }

  }

  onDeviceFilterBtnClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
  }

  onDeviceFilterApply(updateFilterObj = true) {
    console.log(this.filterObj);
    console.log(this.configureHierarchy);
    this.activeCircle = 'all';
    this.mapDevices = JSON.parse(JSON.stringify(this.devices));
    if (this.contextApp.app === 'CMS_Dev') {
      this.healthyDeviceCount = 0;
      this.unhealthyDeviceCount = 0;
      this.devices.forEach(deviceObj => {
        this.derivedKPILatestData.forEach(kpiObj => {
          if (deviceObj.device_id === kpiObj.device_id) {
            deviceObj.kpiValue = kpiObj?.metadata?.healthy;
            if (kpiObj?.metadata?.healthy === true) {
              this.healthyDeviceCount++;
            } else if (kpiObj?.metadata?.healthy === false){
              this.unhealthyDeviceCount++;
            }
          }
        });
      });
    }
    console.log(JSON.stringify(this.mapDevices));
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += (' > ' + this.configureHierarchy[key]);
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = this.configureHierarchy;
      pagefilterObj.hierarchy = { App: this.contextApp.app};
      pagefilterObj.dateOption = 'Last 30 Mins';
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    if (this.mapDevices.length === 0) {
      this.mapFitBounds = false;
      const center = this.commonService.averageGeolocation(this.mapDevices);
      this.centerLatitude = center?.latitude || 23.0225;
      this.centerLongitude = center?.longitude || 72.5714;
      // this.zoom = 8;
    } else {
      this.mapFitBounds = true;
      // this.zoom = undefined;
    }
  }

  onSelect() {
    this.devices = JSON.parse(JSON.stringify(this.filterObj.device));
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
    this.router.navigate(['applications', this.contextApp.app,
    'devices',
    device.device_id, 'control-panel']);
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach(su => su.unsubscribe());
  }


}
