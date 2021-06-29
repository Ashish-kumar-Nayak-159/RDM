import { ToasterService } from './../../services/toaster.service';
import { Subscription } from 'rxjs';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CONSTANTS } from 'src/app/app.constants';
import { DeviceTypeService } from './../../services/device-type/device-type.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';

declare var $: any;
@Component({
  selector: 'app-device-type-control-panel',
  templateUrl: './device-type-control-panel.component.html',
  styleUrls: ['./device-type-control-panel.component.css']
})
export class DeviceTypeControlPanelComponent implements OnInit, OnDestroy {

  deviceType: any;
  isDeviceTypeDataLoading = false;
  activeTab: string;
  menuItems: any[] = CONSTANTS.MODEL_CONTROL_PANEL_SIDE_MENU_LIST;
  contextApp: any;
  userData: any;
  password: any;
  subscriptions: Subscription[] = [];
  isModelFreezeUnfreezeAPILoading = false;
  isPasswordVisible = false;
  constructor(
    private route: ActivatedRoute,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.subscriptions.push(this.route.paramMap.subscribe(async params => {
      if (this.contextApp?.configuration?.model_control_panel_menu?.length > 0) {
        this.menuItems = this.contextApp.configuration.model_control_panel_menu;
      }
      this.getDeviceTypeData(params.get('deviceTypeId'));
    }));
    this.subscriptions.push(this.deviceTypeService.deviceModelRefreshData.subscribe(
      name => {
        this.getDeviceTypeData(name);
      }
    ));
    this.subscriptions.push(this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          const menu = this.contextApp.configuration.model_control_panel_menu.length > 0 ?
          this.contextApp.configuration.model_control_panel_menu :
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

  getDeviceTypeData(deviceTypeId, callFromMenu = false) {
    this.deviceType = undefined;
    this.isDeviceTypeDataLoading = true;
    const obj = {
      name: deviceTypeId,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelDetails(obj.app, obj.name).subscribe(
      (response: any) => {
        if (response) {
          this.deviceType = response;
          this.deviceType.name = obj.name;
          this.deviceType.app = obj.app;
        }
        if (!callFromMenu) {
          setTimeout(() => this.setToggleClassForMenu(), 50);
        }
        this.isDeviceTypeDataLoading = false;
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
    this.subscriptions.push(this.deviceTypeService.freezeDeviceModel(this.contextApp.app, this.deviceType.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Freeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.getDeviceTypeData(this.deviceType.name);
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
    }
    this.isModelFreezeUnfreezeAPILoading = true;
    const obj = {
      email: this.userData.email,
      password: this.password,
      updated_by: this.userData.email + ' (' + this.userData.name + ')'
    };
    this.subscriptions.push(this.deviceTypeService.unfreezeDeviceModel(this.contextApp.app, this.deviceType.name, obj).subscribe(
      (response: any) => {
        this.toasterService.showSuccess(response.message, 'Unfreeze Model');
        this.isModelFreezeUnfreezeAPILoading = false;
        this.getDeviceTypeData(this.deviceType.name);
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
