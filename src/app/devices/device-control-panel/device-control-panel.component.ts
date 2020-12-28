import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-device-control-panel',
  templateUrl: './device-control-panel.component.html',
  styleUrls: ['./device-control-panel.component.css']
})
export class DeviceControlPanelComponent implements OnInit, AfterViewInit {

  activeTab: string;
  device: Device;
  isDeviceDataLoading = false;
  userData: any;
  componentState: any;
  gatewayId: string;
  pageType: any;
  tagsObj: any;
  contextApp: any;
  menuItems: any[] = CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
  tileData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(
      async params => {
        if (this.contextApp?.configuration?.device_control_panel_menu.length > 0) {
          this.menuItems = this.contextApp.configuration.device_control_panel_menu;
          console.log(this.menuItems);
        }
        console.log(this.menuItems);
        if (params.get('deviceId')) {
          if (params.get('listName')) {
            const listName = params.get('listName');
            if (listName.toLowerCase() === 'nonipdevices') {
              this.componentState = CONSTANTS.NON_IP_DEVICE;
              this.pageType = 'Device';
            } else if (listName.toLowerCase() === 'gateways') {
              this.componentState = CONSTANTS.IP_GATEWAY;
              this.pageType = 'Gateway';
            } else if (listName.toLowerCase() === 'devices') {
              this.componentState = CONSTANTS.IP_DEVICE;
              this.pageType = 'Device';
            }
          }
          if (params.get('gatewayId')) {
            this.gatewayId = params.get('gatewayId');
            this.componentState = CONSTANTS.NON_IP_DEVICE;
            this.pageType = 'Device';
          }
          this.getTileName();
          this.pageType = this.pageType.slice(0, -1);
          this.device = new Device();
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
    );
    this.deviceService.reloadDeviceInControlPanelEmitter.subscribe(
      () => {
        this.getDeviceDetail(true);
      }
    );
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      // console.log(item.system_name, '------', this.componentState);
      // console.log(this.pageType);
      if (item.system_name === this.componentState + 's') {
        selectedItem = item.showAccordion;
        console.log(selectedItem);
      }
    });
    this.tileData = selectedItem[1];
  }

  ngAfterViewInit(): void {
    // this.setToggleClassForMenu();
  }


  setToggleClassForMenu() {
    if ($(window).width() > 768 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').addClass('sb-toggle');
    }
    if ($(window).width() > 768 && !$('.sidebar').hasClass('toggled')) {
      console.log('min js 16');
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').removeClass('sb-toggle');
      $('.container-fluid').addClass('sb-notoggle');
    }
    if ($(window).width() < 768 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if ($(window).width() < 768 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').addClass('sb-toggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }

    if ($(window).width() > 768 && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass('sb1-notoggle');
      $('.container1-fluid').addClass('sb1-toggle');
    }
    if ($(window).width() > 768 && !$('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').addClass('sb1-notoggle');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
    if ($(window).width() < 768 && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass('sb1-notoggle');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
    if ($(window).width() < 768 && !$('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').addClass('sb1-toggle');
      $('.container1-fluid').removeClass('sb1-notoggle');
    }
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  onSidebarToggle() {
    $('.sidebar1').toggleClass('toggled');
    if ($('.sidebar1').hasClass('toggled')) {
      // $('.sidebar1 .collapse').collapse('hide');
      $('.container1-fluid').removeClass('sb1-notoggle');
      $('.container1-fluid').addClass('sb1-toggle');
    }
    if (!$('.sidebar1').hasClass('toggled')) {
      // $('.sidebar1 .collapse').collapse('show');
      $('.container1-fluid').addClass('sb1-notoggle');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
  }

  onSideBarToggleTopClick() {
    $('.sidebar1').toggleClass('toggled');
    if ($('.sidebar1').hasClass('toggled')) {
      // $('.sidebar1 .collapse').collapse('hide');
      $('.container1-fluid').addClass('sb1-collapse');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
    if (!$('.sidebar1').hasClass('toggled')) {
      // $('.sidebar1 .collapse').collapse('show');
      $('.container1-fluid').removeClass('sb1-collapse');
      $('.container1-fluid').addClass('sb1-toggle');
    }
  }

  async getDeviceDetail(callFromMenu = false) {
    if (!callFromMenu) {
      this.isDeviceDataLoading = true;
    }
    let methodToCall;
    if (this.componentState === CONSTANTS.NON_IP_DEVICE) {

      const obj = {
        app: this.contextApp.app,
        device_id: this.device.device_id,
        gateway_id: this.device.gateway_id
      };
      methodToCall = this.deviceService.getNonIPDeviceList(obj);
      await this.getDeviceTags(obj);
    } else {
      methodToCall = this.deviceService.getDeviceData(this.device.device_id, this.contextApp.app);
    }
    methodToCall.subscribe(
      (response: any) => {
        if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
          if (response && response.data) {
            const obj = {...response.data[0]};
            obj.tags = this.tagsObj;
            this.device = obj;
          }
        } else {
          this.device = response;
        }
        console.log(this.device);
        this.commonService.breadcrumbEvent.emit({
          type: 'append',
          data: [
              {
                title: (this.device.tags.display_name ? this.device.tags.display_name : this.device.device_id) + ' / Control Panel',
                url:
                'applications/' + this.contextApp.app + '/' + (this.componentState === CONSTANTS.NON_IP_DEVICE ? 'nonIPDevices' :
                (this.pageType.toLowerCase() + 's')) + '/' + this.device.device_id + '/control-panel'
              }
          ]
        });
        this.isDeviceDataLoading = false;
        if (!callFromMenu) {
          setTimeout(
            () => {
              this.setToggleClassForMenu();
            }, 50
          );
        }
      }, () => this.isDeviceDataLoading = false
    );
  }

  getDeviceTags(obj) {
    return new Promise((resolve) => {
      this.deviceService.getNonIPDeviceTags(obj).subscribe(
        (response: any) => {
          this.tagsObj = response.tags;
          resolve();
        }
      );
    });
  }
}
