import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Asset } from 'src/app/models/asset.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-asset-control-panel',
  templateUrl: './asset-control-panel.component.html',
  styleUrls: ['./asset-control-panel.component.css'],
})
export class AssetControlPanelComponent implements OnInit, AfterViewInit, OnDestroy {
  activeTab: string;
  asset: Asset;
  isAssetDataLoading = false;
  userData: any;
  componentState: any;
  gatewayId: string;
  assetId: string;
  // pageType: any;
  tagsObj: any;
  contextApp: any;
  menuItems: any[] = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
  tileData: any;
  subscriptions: Subscription[] = [];
  appUsers: any[] = [];
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
    private applicationService: ApplicationService,
    private commonService: CommonService,
    private toasterService: ToasterService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    await this.getApplicationUsers();
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        if (params.get('assetId')) {
          // this.asset = new Asset();
          this.assetId = params.get('assetId');
          this.getAssetDetail();
        }
      })
    );
    this.subscriptions.push(
      this.route.fragment.subscribe((fragment) => {
        if (fragment) {
          this.activeTab = fragment;
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
      tab_name: this.tileData['IOT Assets Tab Name'],
      table_key: this.tileData['IOT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      tab_name: this.tileData['IOT Gateways Tab Name'],
      table_key: this.tileData['IOT Gateways Table Key Name'],
    };
  }

  ngAfterViewInit(): void {
    // this.setToggleClassForMenu();
  }

  setToggleClassForMenu() {
    if (!$('.sidebar').hasClass('toggled')) {
      $('body').addClass('sidebar-toggled');
      $('.sidebar').addClass('toggled');
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
      this.subscriptions.push(
        this.applicationService.getApplicationUsers(this.contextApp.app).subscribe((response: any) => {
          if (response && response.data) {
            this.appUsers = response.data;
          }
          resolve();
        })
      );
    });
  }

  async getAssetDetail(callFromMenu = false) {
    if (!callFromMenu) {
      this.isAssetDataLoading = true;
    }
    let methodToCall;
    methodToCall = this.assetService.getAssetDetailById(this.contextApp.app, this.assetId);
    this.subscriptions.push(
      methodToCall.subscribe(
        (response: any) => {
          this.asset = response;
          if (!this.asset.tags.asset_users) {
            const userObj = this.appUsers.find((user) => user.user_email === this.asset.tags.asset_manager);
            this.asset.tags.asset_users = {};
            this.asset.tags.asset_users[btoa(this.asset.tags.asset_manager)] = {
              user_email: this.asset.tags.asset_manager,
              user_name: 'NA',
            };
          }
          this.componentState = this.asset.type;
          this.getTileName();
          if (this.componentState === CONSTANTS.IP_ASSET) {
            if (this.contextApp?.menu_settings?.asset_control_panel_menu.length > 0) {
              this.menuItems = this.contextApp.menu_settings.asset_control_panel_menu;
            } else {
              this.menuItems = CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
            }
          } else if (this.componentState === CONSTANTS.NON_IP_ASSET) {
            if (this.contextApp?.menu_settings?.legacy_asset_control_panel_menu.length > 0) {
              this.menuItems = this.contextApp.menu_settings.legacy_asset_control_panel_menu;
            } else {
              this.menuItems = CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST;
            }
          }
          let titleObj;
          let count;
          const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
          const decodedToken = this.commonService.decodeJWTToken(token);
          this.menuItems.forEach((menu) => {
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
              console.log(menu.page, '=====true===', trueCount, '===== false====', falseCount);
              if (trueCount > 0) {
                menu.visible = true;
              } else {
                if (falseCount > 0) {
                  menu.visible = false;
                }
              }
            }
            if (menu.isTitle) {
              console.log(count);
              if (titleObj) {
                titleObj.isDisplay = count > 0 ? true : false;
              }
              count = 0;
              titleObj = menu;
            } else {
              if (menu.visible) {
                count++;
              }
            }
          });
          const menu =
            this.componentState !== CONSTANTS.NON_IP_ASSET
              ? this.contextApp.menu_settings.asset_control_panel_menu.length > 0
                ? this.contextApp.menu_settings.asset_control_panel_menu
                : JSON.parse(JSON.stringify(CONSTANTS.ASSET_CONTROL_PANEL_SIDE_MENU_LIST))
              : this.contextApp.menu_settings.legacy_asset_control_panel_menu.length > 0
              ? this.contextApp.menu_settings.legacy_asset_control_panel_menu
              : JSON.parse(JSON.stringify(CONSTANTS.LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST));
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

  getAssetTags(obj) {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetService.getNonIPAssetTags(obj).subscribe((response: any) => {
          this.tagsObj = response.tags;
          resolve();
        })
      );
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    $('.sidebar').addClass('toggled');
    $('body').removeClass('sidebar-toggled');
    $('.sidebar').removeClass('toggled');
  }
}
