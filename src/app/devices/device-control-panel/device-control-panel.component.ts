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
    this.setToggleClassForMenu();
  }

  setToggleClassForMenu() {
    const $containerDiv = $('.container-fluid');
    const $container1Div = $('.container1-fluid');
    console.log($containerDiv);
    console.log($container1Div);
    if ($(window).width() < 750) {
      $containerDiv.removeClass('sb-notoggle');
      $containerDiv.addClass('sb-toggle');

      $container1Div.removeClass('sb1-notoggle');
      $container1Div.addClass('sb1-toggle');
    } else {
      $containerDiv.removeClass('sb-toggle');
      $containerDiv.addClass('sb-notoggle');

      $container1Div.removeClass('sb1-toggle');
      $container1Div.addClass('sb1-notoggle');
    }
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    window.location.hash = tab;
  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar1-toggled'),
    $('.sidebar1').toggleClass('toggled'),
    $('.sidebar1').hasClass('toggled') &&
    $('.sidebar1 .collapse').collapse('hide');
    const sidebar1 = this.document.getElementsByClassName('sidebar1')[0];
    const container1Div = this.document.getElementsByClassName('container1-fluid')[0];
    console.log(sidebar1);
    console.log(container1Div);
    if (
      sidebar1.classList.contains('toggled')
    ) {
      container1Div.classList.remove('sb1-notoggle');
      container1Div.classList.add('sb1-toggle');
    } else {
      container1Div.classList.remove('sb1-toggle');
      container1Div.classList.add('sb1-notoggle');
    }
  }

  onSideBarToggleTopClick() {
    $('body').toggleClass('sidebar1-toggled'),
    $('.sidebar1').toggleClass('toggled'),
    $('.sidebar1').hasClass('toggled') &&
    $('.sidebar1 .collapse').collapse('hide');
    const pageTop = this.document.getElementById('page-top');
    const container1Div = this.document.getElementsByClassName('container1-fluid')[0];
    console.log(pageTop);
    console.log(container1Div);
    if (pageTop.classList.contains('sidebar1-toggled')) {
      container1Div.classList.remove('sb1-notoggle');
      container1Div.classList.remove('sb1-toggle');
      container1Div.classList.add('sb1-collapse');
    } else {
      container1Div.classList.add('sb1-toggle');
      container1Div.classList.remove('sb1-notoggle');
      container1Div.classList.remove('sb1-collapse');
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
