import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-asset-model-control-panel',
  templateUrl: './asset-model-control-panel.component.html',
  styleUrls: ['./asset-model-control-panel.component.css']
})
export class AssetModelControlPanelComponent implements OnInit, OnDestroy {

  assetModel: any;
  isAssetModelDataLoading = false;
  activeTab: string;
  menuItems: any[] = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
  contextApp: any;
  userData: any;
  password: any;
  subscriptions: Subscription[] = [];
  isModelFreezeUnfreezeAPILoading = false;
  isPasswordVisible = false;
  decodedToken: any;
  constructor(
    private route: ActivatedRoute,
    private assetModelService: AssetModelService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.subscriptions.push(this.route.paramMap.subscribe(async params => {
      if (this.contextApp?.menu_settings?.model_control_panel_menu?.length > 0) {
        this.menuItems = this.contextApp.menu_settings.model_control_panel_menu;
        let titleObj;
        let count;
        this.menuItems.forEach(menu => {
          let trueCount = 0;
          let falseCount = 0;
          menu?.privileges_required?.forEach(privilege => {
            if (this.decodedToken?.privileges?.indexOf(privilege) !== -1) {
              trueCount++;
            } else {
              falseCount++;
            }
          });
          console.log(menu.page, '=====true===', trueCount, '===== false====', falseCount);
          if (trueCount > 0) {
            menu.visible = true;
          } else {
            if (falseCount > 0 ) {
              menu.visible = false;
            }
          }
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
          }
        });
      }
      this.getAssetModelData(params.get('assetModelId'));
    }));
    this.subscriptions.push(this.assetModelService.assetModelRefreshData.subscribe(
      name => {
        this.getAssetModelData(name);
      }
    ));
    this.subscriptions.push(this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          const menu = this.contextApp.menu_settings.model_control_panel_menu.length > 0 ?
          this.contextApp.menu_settings.model_control_panel_menu :
          JSON.parse(JSON.stringify(CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST));
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

  getAssetModelData(assetModelId, callFromMenu = false) {
    this.assetModel = undefined;
    this.isAssetModelDataLoading = true;
    const obj = {
      name: assetModelId,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.assetModelService.getAssetsModelDetails(obj.app, obj.name).subscribe(
      (response: any) => {
        if (response) {
          this.assetModel = response;
          this.assetModel.name = obj.name;
          this.assetModel.app = obj.app;
        }
        if (!callFromMenu) {
          setTimeout(() => this.setToggleClassForMenu(), 50);
        }
        this.isAssetModelDataLoading = false;
      }
    ));
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  freezeModel() {
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.assetModelService.freezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.getAssetModelData(this.assetModel.name);
      }, error => {
        this.toasterService.showError(error.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
      }
    ));
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
  }

  openUnfreezeModal() {
    this.password = undefined;
    $('#passwordCheckModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  unfreezeModel() {
    if (!this.password) {
      this.toasterService.showError('Password is compulsory.', 'Unfreeze Model');
      return;
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.assetModelService.unfreezeAssetModel(this.contextApp.app, this.assetModel.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.getAssetModelData(this.assetModel.name);
        this.onCloseModal('passwordCheckModal');
      }, error => {
        this.toasterService.showError(error.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    $('.sidebar').addClass('toggled');
    $('body').removeClass('sidebar-toggled');
    $('.sidebar').removeClass('toggled');
  }
}
