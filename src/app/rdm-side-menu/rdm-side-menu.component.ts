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
  @Input() appName = '';
  constantsData = CONSTANTS;
  appData: any;
  displayMenuList = [];
  predictiveDemoUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMzUyOWE3MmUtZWJhYi00NzA5LWI1YjktMTMwZDg1NjJiNmY2IiwidCI6IjA4YjdjZmViLTg5N2UtNDY5Yi05NDM2LTk3NGU2OTRhOGRmMiJ9&pageName=ReportSection';
  applicationData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private applicationService: ApplicationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    // if (this.userData && !this.userData.is_super_admin) {
    //   this.appName = this.userData.apps[0].app;
    // }

    if (this.appName) {
      this.applicationData = this.userData.apps.filter(app => app.app === this.decode(this.appName))[0];
      await this.getApplicationData();
      if (!this.userData?.is_super_admin) {
      let data = [];
     // alert('here');
      console.log(this.appData);
      if (this.appData?.configuration?.main_menu?.length > 0) {
        this.constantsData.SIDE_MENU_LIST.forEach(config => {
          let found = false;
          this.appData.configuration.main_menu.forEach(item => {
            if (config.page === item.page) {
              found = true;
              data.push(item);
            }
          });
          if (!found) {
            data.push(config);
          }
        });
      } else {
        data =  this.constantsData.SIDE_MENU_LIST;
      }
      this.processSideMenuData(data, this.appData);
      }
    }
    let i = 0;
    this.router.events.subscribe(async event => {
      if (event instanceof NavigationEnd && i === 0) {
        i++;
        const list = event.url.split('/');
        if (list[1] === 'applications' && list[2]) {
          this.appName = list[2];
        } else {
          if (this.userData && !this.userData.is_super_admin) {
            this.appName = this.userData.apps[0].app;
          }
        }
        if (this.appName) {
        this.applicationData = this.userData.apps.filter(app => app.app === this.decode(this.appName))[0];
        await this.getApplicationData();
        if (!this.userData?.is_super_admin) {
        let data = [];
        if (this.appData.configuration?.main_menu?.length > 0) {
          this.constantsData.SIDE_MENU_LIST.forEach(config => {
            let found = false;
            this.appData.configuration.main_menu.forEach(item => {
              if (config.page === item.page) {
                found = true;
                data.push(item);
              }
            });
            if (!found) {
              data.push(config);
            }
          });
        } else {
          data =  this.constantsData.SIDE_MENU_LIST;
        }
        this.processSideMenuData(data, this.appData);
        }
        }
      }
    });

    this.commonService.refreshSideMenuData.subscribe(list => {
      const config = list.configuration?.main_menu?.length > 0 ? list.configuration.main_menu : CONSTANTS.SIDE_MENU_LIST;
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
      this.appData = this.userData.apps.filter(app => app.app === this.decode(this.appName))[0];
      await this.getApplicationData();
    }
  }

  getApplicationData() {
    return new Promise((resolve) => {
      this.applicationService.getApplicationDetail(this.appName).subscribe(
        (response: any) => {
            this.appData = response;
            console.log(response);
            if (this.applicationData?.user) {
            this.appData.user = this.applicationData.user;
            }
            resolve();
        });
    });
  }

  processSideMenuData(data, list) {
    // alert('here');
    console.log('data    ', data);
    const arr = [];
    console.log(list);
    data.forEach(item => {
      if (list.metadata.contain_gateways) {
        console.log('in gateway');
        if (item.page !== 'Devices') {
          arr.push(item);
        }
      }
      if (list.metadata.contain_devices) {
        console.log('in device');
        if (item.page !== 'Gateways' && item.page !== 'Non IP Devices') {
          arr.push(item);
        }
      }
  });
    if (this.appData?.user.role !== CONSTANTS.APP_ADMIN_ROLE) {
      arr.forEach(element => {
        if (element.page === 'App Settings' || element.page === 'Things Modelling') {
          element.visible = false;
        }
      });
      console.log('in if', arr);
    }
    this.displayMenuList = arr;
    console.log(this.displayMenuList);
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
