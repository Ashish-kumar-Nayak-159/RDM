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
  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
    private deviceTypeService: DeviceTypeService,
    private commonService: CommonService,
    private applicationService: ApplicationService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.route.paramMap.subscribe(async params => {
      if (this.contextApp?.configuration?.model_control_panel_menu?.length > 0) {
        this.menuItems = this.contextApp.configuration.model_control_panel_menu;
      }
      this.getDeviceTypeData(params.get('deviceTypeId'));
    });

    this.route.fragment.subscribe(
      fragment => {
        if (fragment) {
          this.activeTab = fragment;
        } else {
          this.activeTab = 'overview';
        }
      }
    );
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

  getDeviceTypeData(deviceTypeId, callFromMenu = false) {
    this.isDeviceTypeDataLoading = true;
    const obj = {
      name: deviceTypeId,
      app: this.contextApp.app
    };
    this.subscriptions.push(this.deviceTypeService.getThingsModelsList(obj).subscribe(
      (response: any) => {
        if (response && response.data && response.data.length > 0) {
          this.deviceType = response.data[0];
          this.commonService.breadcrumbEvent.emit({
            type: 'append',
            data: [
                {
                  title: (this.deviceType.name) + ' / Model Definition',
                  url:
                  'applications/' + this.contextApp.app + '/things/model/' + this.deviceType.name + '/control-panel'
                }
            ]
          });
        }
        this.isDeviceTypeDataLoading = false;
        if (!callFromMenu) {
          setTimeout(
            () => {
              this.setToggleClassForMenu();
            }, 50
          );
        }
      }
    ));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
