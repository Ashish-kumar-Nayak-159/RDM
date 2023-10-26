import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { constants } from 'fs';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Asset } from 'src/app/models/asset.model';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import { AssetService } from 'src/app/services/assets/asset.service';

@Component({
  selector: 'app-gateway-control-panel',
  templateUrl: './gateway-control-panel.component.html',
  styleUrls: ['./gateway-control-panel.component.css'],
})
export class GatewayControlPanelComponent implements OnInit, OnDestroy {
  activeTab: string;
  asset: Asset;
  isAssetDataLoading = false;
  userData: any;
  componentState: any;
  gatewayId: string;
  pageType: any;
  tagsObj: any;
  contextApp: any;
  menuItems: any[] = CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST;
  tileData: any;
  subscriptions: Subscription[] = [];
  iotAssetsPage = 'Assets';
  legacyAssetsPage = 'Non IP Assets';
  iotGatewaysPage = 'Gateways';
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  decodedToken: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private assetService: AssetService,
    private route: ActivatedRoute,
    public commonService: CommonService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        if (this.contextApp?.menu_settings?.gateway_control_panel_menu.length > 0) {
          this.menuItems = this.contextApp.menu_settings.gateway_control_panel_menu;
          let titleObj;
          let count;
          const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
          const decodedToken = this.commonService.decodeJWTToken(token);
          this.menuItems.forEach((menu, index) => {
            if (menu.visible) {
              let trueCount = 0;
              let falseCount = 0;
              menu?.privileges_required?.forEach((privilege) => {
                if (decodedToken?.privileges?.indexOf(privilege) !== -1) {
                  trueCount++;
                } else {
                  falseCount++;
                }
              });
              if (trueCount > 0) {
                menu.visible = true;
              } else {
                if (falseCount > 0) {
                  menu.visible = false;
                }
              }
            }
            // if (menu.for_admin_only && this.contextApp?.user.role !== CONSTANTS.APP_ADMIN_ROLE) {
            //   menu.visible = false;
            // } else if (menu.for_admin_only && this.contextApp?.user.role === CONSTANTS.APP_ADMIN_ROLE){
            //   menu.visible = true;
            // }
            if (menu.isTitle) {
              if (titleObj) {
                titleObj.isDisplay = count > 0 ? true : false;
              }
              count = 0;
              titleObj = menu;
            } else {
              if (menu.visible) {
                count++;
              }
              if (!this.menuItems[index + 1]) {
                if (titleObj) {
                  titleObj.isDisplay = count > 0 ? true : false;
                }
                count = 0;
                titleObj = menu;
              }
            }
          });
        }
        if (params.get('assetId')) {
          // if (params.get('listName')) {
          //   const listName = params.get('listName');
          //   if (listName.toLowerCase() === 'gateways') {
          //     this.componentState = CONSTANTS.IP_GATEWAY;
          //     this.pageType = 'Gateway';
          //   }
          // }
          // if (params.get('gatewayId')) {
          //   this.gatewayId = params.get('gatewayId');
          //   this.componentState = CONSTANTS.NON_IP_ASSET;
          //   this.pageType = 'Asset';
          // }

          // this.pageType = this.pageType.slice(0, -1);
          this.asset = new Asset();
          this.asset.asset_id = params.get('assetId');
          this.getAssetDetail();
        }
      })
    );
    this.subscriptions.push(
      this.route.fragment.subscribe((fragment) => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          const menu =
            this.contextApp.menu_settings.gateway_control_panel_menu.length > 0
              ? this.contextApp.menu_settings.gateway_control_panel_menu
              : JSON.parse(JSON.stringify(CONSTANTS.GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST));
          menu.forEach((menuObj) => {
            if (!this.activeTab && menuObj.visible && !menuObj.isTitle) {
              this.activeTab = menuObj.page;
              return;
            }
          });
          if (!this.activeTab) {
            this.toasterService.showError(
              'All the menu items visibility are off. Please contact administrator',
              'App Selection'
            );
            return;
          }
        }
      })
    );
    this.subscriptions.push(
      this.assetService.reloadAssetInControlPanelEmitter.subscribe(() => {
        this.getAssetDetail(true);
      })
    );
  }

  getMenuDetail(pageType) {
    return this.menuItems.find((menu) => menu.page === pageType);
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Assets') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = {};
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    this.iotAssetsTab = {
      tab_name: this.tileData['IoT Assets Tab Name'],
      table_key: this.tileData['IoT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      tab_name: this.tileData['IoT Gateways Tab Name'],
      table_key: this.tileData['IoT Gateways Table Key Name'],
    };
  }

  setToggleClassForMenu() {
    if (!$('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
      // $('.sidebar .collapse').collapse('hide');
    }
    if ($(window).width() > 992 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-toggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }
    if ($(window).width() > 992 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-toggle');
      $('.container-fluid').addClass('sb-notoggle');
    }
    if ($(window).width() > 480 && $(window).width() < 992 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if ($(window).width() > 480 && $(window).width() < 992 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-toggle');
      $('.container-fluid').removeClass('sb-notoggle');
    }
    if ($(window).width() < 480 && $('.sidebar').hasClass('toggled')) {
      $('.container-fluid').addClass('sb-collapse');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if ($(window).width() < 480 && !$('.sidebar').hasClass('toggled')) {
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').addClass('sb-toggle');
    }
    if ($(window).width() > 992 && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass('sb1-notoggle');
      $('.container1-fluid').addClass('sb1-toggle');
    }
    if ($(window).width() > 992 && !$('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').addClass('sb1-notoggle');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
    if ($(window).width() < 992 && $('.sidebar1').hasClass('toggled')) {
      $('.container1-fluid').removeClass('sb1-notoggle');
      $('.container1-fluid').removeClass('sb1-toggle');
    }
    if ($(window).width() < 992 && !$('.sidebar1').hasClass('toggled')) {
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

  async getAssetDetail(callFromMenu = false) {
    if (!callFromMenu) {
      this.isAssetDataLoading = true;
    }
    let methodToCall;
    methodToCall = this.assetService.getAssetDetailById(this.contextApp.app, this.asset.asset_id);
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.asset = response;
          this.componentState = this.asset.type;
          // this.asset.gateway_id = this.asset.metadata?.gateway_id;
          this.getTileName();
          this.isAssetDataLoading = false;
          if (!callFromMenu) {
            setTimeout(() => {
              this.setToggleClassForMenu();
            }, 50);
          }
        },
        () => (this.isAssetDataLoading = false)
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    $('.sidebar').addClass('toggled');
    $('body').removeClass('sidebar-toggled');
    $('.sidebar').removeClass('toggled');
  }
}
