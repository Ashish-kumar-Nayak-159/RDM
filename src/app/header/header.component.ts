import { environment } from './../../environments/environment';
import { Component, OnInit, Inject, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
import { CONSTANTS } from '../app.constants';
import { filter } from 'rxjs/operators';
import { data } from 'jquery';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {
  breadcrumbData: any[] = [];
  userData: any;
  @Input() url: string;
  @Input() isLoginRoute = false;
  @Input() contextApp: any;
  blobToken = environment.blobKey;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.commonService.breadcrumbEvent.subscribe((breadcrumbs: any) => {
      this.commonService.setItemInLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE, this.breadcrumbData);
      if (breadcrumbs.type === 'replace') {
        this.breadcrumbData = breadcrumbs.data;
      } else if (breadcrumbs.type === 'append') {
        if (this.breadcrumbData && this.breadcrumbData.length > 0 ) {
          breadcrumbs.data.forEach(item => {
            let isFound = false;
            this.breadcrumbData.forEach(obj => {
              if (obj.url === item.url) {
                isFound = true;
              }
            });
            if (!isFound) {
              this.breadcrumbData.splice(this.breadcrumbData.length, 0, item);
            }
          });
        } else {
          this.breadcrumbData = breadcrumbs.data;
        }
      }
    });
   }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    // this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp && this.userData) {
      if (this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      }
    }
    this.router.events
    .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
    .subscribe(event => {
      if (
        event.id === 1 &&
        event.url === event.urlAfterRedirects
      ) {
        this.breadcrumbData = this.commonService.getItemFromLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE);
      }
    });
    this.commonService.refreshSideMenuData.subscribe(list => {

      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp?.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      } else if (this.contextApp  && this.contextApp.metadata) {
        this.contextApp.metadata.header_logo = list.metadata.header_logo;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (changes && this.userData) {
      // this.appName = changes.appName.currentValue;
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp && this.contextApp.metadata && !this.contextApp.metadata.header_logo) {
        this.contextApp.metadata.header_logo = {
          url : CONSTANTS.DEFAULT_HEADER_LOGO
        };
      }
    }
  }

  redirectToFirstMenu() {
    const menu = this.contextApp.configuration.main_menu.length > 0 ?
    this.contextApp.configuration.main_menu : CONSTANTS.SIDE_MENU_LIST;
    let i = 0;
    menu.forEach(menuObj => {
      if ( i === 0 && menuObj.visible) {
        i++;
        const url = menuObj.url;
        if (menuObj.url?.includes(':appName')) {
          menuObj.url = menuObj.url.replace(':appName', this.contextApp.app);
          this.router.navigateByUrl(menuObj.url);
        }
      }
    });
  }

  onClickOfBreadcrumbItem(obj, index) {
    const arr = JSON.parse(JSON.stringify(this.breadcrumbData));
    for (let i = this.breadcrumbData.length - 1; i >= index; i--) {
      arr.splice(i, 1);
    }

    this.breadcrumbData = JSON.parse(JSON.stringify(arr));
    this.router.navigate([obj.url], {queryParams: (obj.queryParams ? obj.queryParams : undefined)});
  }


  onSideBarToggleTopClick() {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    if ($('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("hide");
      $('.container-fluid').addClass('sb-collapse');
      $('.container-fluid').removeClass('sb-toggle');
    }
    if (!$('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("show");
      $('.container-fluid').removeClass('sb-collapse');
      $('.container-fluid').addClass('sb-toggle');
    }
  }

  decode(item) {
    return decodeURIComponent(item);
  }

  onLogout() {
    $('#logoutModal').modal('hide');
    this.commonService.onLogOut();
  }

}
