import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
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
export class DeviceControlPanelComponent implements OnInit, AfterViewInit, OnDestroy {

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
  subscriptions: Subscription[] = [];
  appUsers: any[] = [];
  iotDevicesPage = 'Assets';
  legacyDevicesPage = 'Non IP Assets';
  iotGatewaysPage = 'Gateways';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getApplicationUsers();

    this.subscriptions.push(this.route.paramMap.subscribe(
      async params => {
        if (params.get('deviceId')) {
          if (params.get('listName')) {
            const listName = params.get('listName');
            if (listName.toLowerCase() === 'nonipdevices') {
              this.componentState = CONSTANTS.NON_IP_DEVICE;
              this.pageType = 'Device';
            } else if (listName.toLowerCase() === 'devices') {
              this.componentState = CONSTANTS.IP_DEVICE;
              this.pageType = 'Device';
            }
            if (this.componentState === CONSTANTS.IP_DEVICE) {
              if (this.contextApp?.configuration?.device_control_panel_menu.length > 0) {
                this.menuItems = this.contextApp.configuration.device_control_panel_menu;
              } else {
                this.menuItems = CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
              }
            } else if (this.componentState === CONSTANTS.NON_IP_DEVICE) {
              if (this.contextApp?.configuration?.legacy_device_control_panel_menu.length > 0) {
                this.menuItems = this.contextApp.configuration.legacy_device_control_panel_menu;
              } else {
                this.menuItems = CONSTANTS.LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST;
              }
            }
          }
            // if (params.get('gatewayId')) {
            //   this.gatewayId = params.get('gatewayId');
            //   this.componentState = CONSTANTS.NON_IP_DEVICE;
            //   this.pageType = 'Device';
            // }
          this.getTileName();
          this.pageType = this.pageType.slice(0, -1);
          this.device = new Device();
          this.device.device_id = params.get('deviceId');
          this.getDeviceDetail();
          }
      }
    ));
    this.subscriptions.push(this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;

        } else {
          const menu = this.componentState !== CONSTANTS.NON_IP_DEVICE ?
          (this.contextApp.configuration.device_control_panel_menu.length > 0 ?
          this.contextApp.configuration.device_control_panel_menu :
          JSON.parse(JSON.stringify(CONSTANTS.DEVICE_CONTROL_PANEL_SIDE_MENU_LIST))) :
          (this.contextApp.configuration.legacy_device_control_panel_menu.length > 0 ?
            this.contextApp.configuration.legacy_device_control_panel_menu :
            JSON.parse(JSON.stringify(CONSTANTS.LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST)))
          menu.forEach(menuObj => {
            if ( !this.activeTab && menuObj.visible && !menuObj.isTitle) {
              this.activeTab = menuObj.page;
              return;
            }
          });
          if (!this.activeTab) {
            this.toasterService.showError('All the menu items visibility are off. Please contact administrator', 'App Selection');
            return;
          }
        }
      }
    ));
    this.subscriptions.push(this.deviceService.reloadDeviceInControlPanelEmitter.subscribe(
      () => {
        this.getDeviceDetail(true);
      }
    ));
  }

  getMenuDetail(pageType) {
    return this.menuItems.find(menu => menu.page === pageType);
  }

  getTileName() {
    let selectedItem;
    this.contextApp.configuration.main_menu.forEach(item => {
      if ((item.page === this.iotDevicesPage && this.componentState === CONSTANTS.IP_DEVICE) ||
      (item.page === this.legacyDevicesPage && this.componentState === CONSTANTS.NON_IP_DEVICE) ||
      (item.page === this.iotGatewaysPage && this.componentState === CONSTANTS.IP_GATEWAY)) {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem[1];
  }

  ngAfterViewInit(): void {
    // this.setToggleClassForMenu();


  }


  setToggleClassForMenu() {
    if (!$('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
      $('.sidebar .collapse').collapse('hide');
    } else {
      $('body').removeClass('sidebar-toggled');
      $('.sidebar').removeClass('toggled');
    }
    if (($(window).width() > 768) && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass( 'sb-collapse' );
      $('.container-fluid').removeClass( 'sb-notoggle' );
      $('.container-fluid').addClass( 'sb-toggle' );
      }
    if (($(window).width() > 768) && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass( 'sb-collapse' );
      $('.container-fluid').removeClass( 'sb-toggle' );
      $('.container-fluid').addClass( 'sb-notoggle' );
      }
    if (($(window).width() < 768) && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass( 'sb-collapse' );
      $('.container-fluid').removeClass( 'sb-notoggle' );
      $('.container-fluid').removeClass( 'sb-toggle' );
      }
    if (($(window).width() < 768) && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass( 'sb-collapse' );
      $('.container-fluid').addClass( 'sb-toggle' );
      $('.container-fluid').removeClass( 'sb-notoggle' );
      }
    if (($(window).width() > 768) && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass( 'sb1-notoggle' );
      $('.container1-fluid').addClass( 'sb1-toggle' );
      }
    if (($(window).width() > 768) && !$('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').addClass( 'sb1-notoggle' );
      $('.container1-fluid').removeClass( 'sb1-toggle' );
      }
    if (($(window).width() < 768) && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass( 'sb1-notoggle' );
      $('.container1-fluid').removeClass( 'sb1-toggle' );
      }
    if (($(window).width() < 768) && !$('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').addClass( 'sb1-toggle' );
      $('.container1-fluid').removeClass( 'sb1-notoggle' );
      }
  }

  setActiveTab(tab) {
    this.activeTab = undefined;
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

  getApplicationUsers() {
    return new Promise<void>((resolve) => {
    this.appUsers = [];
    this.subscriptions.push(this.applicationService.getApplicationUsers(this.contextApp.app).subscribe(
      (response: any) => {
        if (response && response.data) {
          this.appUsers = response.data;
        }
        resolve();
      }
    ));
    });
  }

  async getDeviceDetail(callFromMenu = false) {

    if (!callFromMenu) {
      this.isDeviceDataLoading = true;
    }
    let methodToCall;
    methodToCall = this.deviceService.getDeviceDetailById(this.contextApp.app, this.device.device_id);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.device = response;
        this.device.gateway_id = this.device.configuration?.gateway_id;
        if (!this.device.tags.device_users) {
          const userObj = this.appUsers.find(user => user.user_email === this.device.tags.device_manager);
          this.device.tags.device_users = {};
          this.device.tags.device_users[btoa(this.device.tags.device_manager)] = {
            user_email: this.device.tags.device_manager,
            user_name: 'NA'
          };
        }
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
    ));
  }

  getDeviceTags(obj) {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(this.deviceService.getNonIPDeviceTags(obj).subscribe(
        (response: any) => {
          this.tagsObj = response.tags;
          resolve();
        }
      ));
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    $('.sidebar').addClass('toggled');
    this.setToggleClassForMenu();
  }
}
