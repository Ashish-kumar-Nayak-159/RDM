import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DeviceService } from 'src/app/services/devices/device.service';
import { Device } from 'src/app/models/device.model';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-device-control-panel',
  templateUrl: './device-control-panel.component.html',
  styleUrls: ['./device-control-panel.component.css']
})
export class DeviceControlPanelComponent implements OnInit, AfterViewInit {

  activeTab: string;
  device: Device = new Device();
  isDeviceDataLoading = false;
  userData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private commonService: CommonService

  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    this.route.paramMap.subscribe(
      params => {
        if (params.get('deviceId')) {
          this.device.device_id = params.get('deviceId');
          this.commonService.breadcrumbEvent.emit(this.userData.app + '/Devices/' + this.device.device_id + '/Control Panel');
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

  ngAfterViewInit(): void {
    //this.setToggleClassForMenu();
  }

  setToggleClassForMenu() {
    if ($(window).width() > 768 && $(".sidebar").hasClass("toggled")) {
      $(".container-fluid").removeClass("sb-collapse");
      $(".container-fluid").removeClass("sb-notoggle");
      $(".container-fluid").addClass("sb-toggle");
    }
    if ($(window).width() > 768 && !$(".sidebar").hasClass("toggled")) {
      console.log('min js 16');
      $(".container-fluid").removeClass("sb-collapse");
      $(".container-fluid").removeClass("sb-toggle");
      $(".container-fluid").addClass("sb-notoggle");
    }
    if ($(window).width() < 768 && $(".sidebar").hasClass("toggled")) {
      $(".container-fluid").removeClass("sb-collapse");
      $(".container-fluid").removeClass("sb-notoggle");
      $(".container-fluid").removeClass("sb-toggle");
    }
    if ($(window).width() < 768 && !$(".sidebar").hasClass("toggled")) {
      $(".container-fluid").removeClass("sb-collapse");
      $(".container-fluid").addClass("sb-toggle");
      $(".container-fluid").removeClass("sb-notoggle");
    }

    if ($(window).width() > 768 && $(".sidebar1").hasClass("toggled")) {
      $(".container1-fluid").removeClass("sb1-notoggle");
      $(".container1-fluid").addClass("sb1-toggle");
    }
    if ($(window).width() > 768 && !$(".sidebar1").hasClass("toggled")) {
      $(".container1-fluid").addClass("sb1-notoggle");
      $(".container1-fluid").removeClass("sb1-toggle");
    }
    if ($(window).width() < 768 && $(".sidebar1").hasClass("toggled")) {
      $(".container1-fluid").removeClass("sb1-notoggle");
      $(".container1-fluid").removeClass("sb1-toggle");
    }
    if ($(window).width() < 768 && !$(".sidebar1").hasClass("toggled")) {
      $(".container1-fluid").addClass("sb1-toggle");
      $(".container1-fluid").removeClass("sb1-notoggle");
    }
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  onSidebarToggle() {
    $(".sidebar1").toggleClass("toggled");
    if ($(".sidebar1").hasClass("toggled")) {
      $(".sidebar1 .collapse").collapse("hide");
      $(".container1-fluid").removeClass("sb1-notoggle");
      $(".container1-fluid").addClass("sb1-toggle");
    }
    if (!$(".sidebar1").hasClass("toggled")) {
      $(".sidebar1 .collapse").collapse("show");
      $(".container1-fluid").addClass("sb1-notoggle");
      $(".container1-fluid").removeClass("sb1-toggle");
    }
  }

  onSideBarToggleTopClick() {
    $(".sidebar1").toggleClass("toggled");
    if ($(".sidebar1").hasClass("toggled")) {
      $(".sidebar1 .collapse").collapse("hide");
      $(".container1-fluid").addClass("sb1-collapse");
      $(".container1-fluid").removeClass("sb1-toggle");
    }
    if (!$(".sidebar1").hasClass("toggled")) {
      $(".sidebar1 .collapse").collapse("show");
      $(".container1-fluid").removeClass("sb1-collapse");
      $(".container1-fluid").addClass("sb1-toggle");
    }
  }

  getDeviceDetail(callFromMenu = false) {
    if (!callFromMenu) {
      this.isDeviceDataLoading = true;
    }
    this.deviceService.getDeviceData(this.device.device_id).subscribe(
      (response: any) => {
        this.device = response;
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
}
