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
  @Input() appName = '';
  @Input() isLoginRoute = false;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.commonService.breadcrumbEvent.subscribe(data => {
      this.commonService.setItemInLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE, this.breadcrumbData);
      if (data.type === 'replace') {
        this.breadcrumbData = data.data;
      } else if (data.type === 'append') {
        if (this.breadcrumbData && this.breadcrumbData.length > 0 ) {
          data.data.forEach(item => {
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
          this.breadcrumbData = data.data;
        }
      }
    });
   }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  onClickOfBreadcrumbItem(obj, index) {
    const arr = JSON.parse(JSON.stringify(this.breadcrumbData));
    for (let i = this.breadcrumbData.length - 1; i >= index; i--) {
      arr.splice(i, 1);
    }

    this.breadcrumbData = JSON.parse(JSON.stringify(arr));
    this.router.navigate([obj.url], {queryParams: (obj.queryParams ? obj.queryParams : undefined)});
  }

  onClickOfAppChange(app) {
    this.commonService.refreshSideMenuData.emit(app);
    this.router.navigate(['applications', app.app]);
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

  onLogout() {
    $('#logoutModal').modal('hide');
    this.commonService.onLogOut();
  }

}
