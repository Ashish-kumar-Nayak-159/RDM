import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
})
export class RDMSideMenuComponent implements OnInit, OnChanges {

  userData: any;
  @Input() appName = '';
  constantsData = CONSTANTS;
  appData: any;
  displayMenuList = [];
  predictiveDemoUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMzUyOWE3MmUtZWJhYi00NzA5LWI1YjktMTMwZDg1NjJiNmY2IiwidCI6IjA4YjdjZmViLTg5N2UtNDY5Yi05NDM2LTk3NGU2OTRhOGRmMiJ9&pageName=ReportSection';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.appData = this.userData.apps.filter(app => app.app === this.decode(this.appName))[0];
    console.log(this.appData);
    if (!this.userData?.is_super_admin) {
    let data = [];
    if (this.appData.configuration && this.appData.configuration.length > 0) {
      data = this.appData.configuration;
    } else {
      data =  this.constantsData.SIDE_MENU_LIST;
    }
    this.processSideMenuData(data);
    this.commonService.refreshSideMenuData.subscribe(list => {
      this.processSideMenuData(list.configuration);
      const index = this.userData.apps.findIndex(app => app.app === list.app);
      this.userData.apps.splice(index, 1);
      this.userData.apps.splice(index, 0, list);
      this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);
    });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userData) {
      this.appData = this.userData.apps.filter(app => app.app === this.decode(this.appName))[0];
    }
  }

  processSideMenuData(data) {
    const arr = [];
    data.forEach(item => {
      if (this.appData.metadata.contain_gateways) {
        if (item.page !== 'Devices') {
          arr.push(item);
        }
      }
      if (this.appData.metadata.contain_devices) {
        if (item.page !== 'Gateways') {
          arr.push(item);
        }
      }
    });
    this.displayMenuList = arr;
  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    if ($('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("hide");
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').addClass('sb-toggle');
    }
    if (!$('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("show");
      $('.container-fluid').addClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
  }

  getURL(url) {
    return url ? url.replace(':appName', this.decode(this.appName)) : url;
  }

  decode(item) {
    return decodeURIComponent(item);
  }

}
