import { element } from 'protractor';
import { ApplicationService } from 'src/app/services/application/application.service';
import { filter } from 'rxjs/operators';
import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
})
export class RDMSideMenuComponent implements OnInit, OnChanges {

  userData: any;
  constantsData = CONSTANTS;
  contextApp: any;
  displayMenuList = [];
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    // if (this.userData && !this.userData.is_super_admin) {
    //   this.appName = this.userData.apps[0].app;
    // }

    if (this.contextApp?.app) {
      if (!this.userData?.is_super_admin) {
      let data = [];
     // alert('here');
      console.log(this.contextApp);
      const arr = JSON.parse(JSON.stringify(this.constantsData.SIDE_MENU_LIST));
      if (this.contextApp?.configuration?.main_menu?.length > 0) {
        arr.forEach(config => {
          let found = false;
          this.contextApp.configuration.main_menu.forEach(item => {
            if (config.page === item.page) {
              found = true;
              config.display_name = item.display_name;
              config.visible = item.visible;
              config.showAccordion = item.showAccordion;
              data.push(config);
            }
          });
          if (!found) {
            data.push(config);
          }
        });
      } else {
        data =  arr;
      }
      console.log('60   ', data);
      this.processSideMenuData(data, this.contextApp);
      }
    }
    let i = 0;
    this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd && i === 0) {
        i++;
        if (this.contextApp?.app) {
        if (!this.userData?.is_super_admin) {
        let data = [];
        const arr = JSON.parse(JSON.stringify(this.constantsData.SIDE_MENU_LIST));
        if (this.contextApp.configuration?.main_menu?.length > 0) {
          arr.forEach(config => {
            let found = false;
            this.contextApp.configuration.main_menu.forEach(item => {
              if (config.page === item.page) {
                found = true;
                config.display_name = item.display_name;
                config.visible = item.visible;
                config.showAccordion = item.showAccordion;
                data.push(config);
              }
            });
            if (!found) {
              data.push(config);
            }
          });
        } else {
          data =  arr;
        }
        this.processSideMenuData(data, this.contextApp);
        }
        }
      }
    });

    this.commonService.refreshSideMenuData.subscribe(list => {
      console.log(list);
      let config = list.configuration?.main_menu?.length > 0 ? list.configuration.main_menu :
      JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
      config = JSON.parse(JSON.stringify(config));
      this.processSideMenuData(config, list);
      // const index = this.userData.apps.findIndex(app => app.app === list.app);
      // const obj = this.userData.apps[index];
      // this.userData.apps.splice(index, 1);
      // this.userData.apps.splice(index, 0, obj);
      // this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, this.userData);
    });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.userData) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    }
  }

  processSideMenuData(data, list) {
    // alert('here');
    console.log('data-117    ', data);
    const arr = JSON.parse(JSON.stringify(data));
    console.log(list);
    arr.forEach(element => {
      if (element.page === 'Things Modelling') {
        if (this.contextApp?.user.role !== CONSTANTS.APP_ADMIN_ROLE) {
        element.visible = false;
        } else {
          element.visible = true;
        }
      }
    });
    console.log('in if - 129', JSON.stringify(arr));
    this.displayMenuList = arr;
    console.log('131   ', this.displayMenuList);
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
    return url ? url.replace(':appName', this.decode(this.contextApp.app)) : url;
  }

  decode(item) {
    return decodeURIComponent(item);
  }

}
