import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { constants } from 'fs';
import { CONSTANTS } from 'src/app/app.constants';
import { Device } from 'src/app/models/device.model';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { DeviceService } from 'src/app/services/devices/device.service';

@Component({
  selector: 'app-gateway-control-panel',
  templateUrl: './gateway-control-panel.component.html',
  styleUrls: ['./gateway-control-panel.component.css']
})
export class GatewayControlPanelComponent implements OnInit, OnDestroy {

  activeTab: string;
  device: Device;
  isDeviceDataLoading = false;
  userData: any;
  componentState: any;
  gatewayId: string;
  pageType: any;
  tagsObj: any;
  contextApp: any;
  menuItems: any[] = CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
  tileData: any;
  subscriptions: Subscription[] = [];
  iotDevicesPage = 'Assets';
  legacyDevicesPage = 'Non IP Assets';
  iotGatewaysPage = 'Gateways';
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.route.paramMap.subscribe(
      async params => {
        if (this.contextApp?.configuration?.gateway_control_panel_menu.length > 0) {
          this.menuItems = this.contextApp.configuration.gateway_control_panel_menu;
          let titleObj;
          let count;
          this.menuItems.forEach((menu, index) => {
            if (menu.isTitle) {
              console.log(count);
              if (titleObj) {
                titleObj.isDisplay = count > 0 ? true : false;
                console.log('isideeeeee', titleObj);
              }
              count = 0;
              titleObj = menu;
              console.log(titleObj);
            } else {
              if (menu.visible) {
                count++;
              }
              if (!this.menuItems[index + 1]) {
                if (titleObj) {
                  titleObj.isDisplay = count > 0 ? true : false;
                  console.log('isideeeeee', titleObj);
                }
                count = 0;
                titleObj = menu;
              }
              console.log(count);
            }
          });
          console.log(JSON.stringify(this.menuItems));
        }
        if (params.get('deviceId')) {
          // if (params.get('listName')) {
          //   const listName = params.get('listName');
          //   if (listName.toLowerCase() === 'gateways') {
          //     this.componentState = CONSTANTS.IP_GATEWAY;
          //     this.pageType = 'Gateway';
          //   }
          // }
          // if (params.get('gatewayId')) {
          //   this.gatewayId = params.get('gatewayId');
          //   this.componentState = CONSTANTS.NON_IP_DEVICE;
          //   this.pageType = 'Device';
          // }

          // this.pageType = this.pageType.slice(0, -1);
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
          const menu = this.contextApp.configuration.gateway_control_panel_menu.length > 0 ?
          this.contextApp.configuration.gateway_control_panel_menu :
          JSON.parse(JSON.stringify(CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST));
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
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = {};
    selectedItem.forEach(item => {
      this.tileData[item.name] = item.value;
    });
    this.iotAssetsTab = {
      tab_name: this.tileData['IOT Assets Tab Name'],
      table_key: this.tileData['IOT Assets Table Key Name']
    };
    this.legacyAssetsTab = {
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name']
    };
    this.iotGatewaysTab = {
      tab_name: this.tileData['IOT Gateways Tab Name'],
      table_key: this.tileData['IOT Gateways Table Key Name']
    };
  }


  setToggleClassForMenu() {
    if (!$('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
      // $('.sidebar .collapse').collapse('hide');
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
    methodToCall = this.deviceService.getDeviceDetailById(this.contextApp.app, this.device.device_id);
    this.subscriptions.push(methodToCall.subscribe(
      (response: any) => {
        this.device = response;
        this.componentState = this.device.type;
        // this.device.gateway_id = this.device.metadata?.gateway_id;
        this.getTileName();
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    $('.sidebar').addClass('toggled');
    $('body').removeClass('sidebar-toggled');
    $('.sidebar').removeClass('toggled');
  }
}
