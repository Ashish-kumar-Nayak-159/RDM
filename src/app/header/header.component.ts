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
      console.log(data);
      this.commonService.setItemInLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE, this.breadcrumbData);
      console.log('breadcrumb data', this.breadcrumbData);
      if (data.type === 'replace') {
        this.breadcrumbData = data.data;
      } else if (data.type === 'append') {
        if (this.breadcrumbData && this.breadcrumbData.length > 0 ) {
          console.log('in else if if');
          data.data.forEach(item => {
            this.breadcrumbData.splice(this.breadcrumbData.length, 0, item);
          });
          console.log(this.breadcrumbData);
        } else {
          console.log('in else if else');
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
        console.log('page refreshed');
        this.breadcrumbData = this.commonService.getItemFromLocalStorage(CONSTANTS.CURRENT_BREADCRUMB_STATE);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  onClickOfBreadcrumbItem(obj, index) {
    console.log(obj);
    console.log(index);
    console.log(JSON.stringify(this.breadcrumbData));
    const arr = JSON.parse(JSON.stringify(this.breadcrumbData));
    console.log(this.breadcrumbData.length);
    for (let i = this.breadcrumbData.length - 1; i >= index; i--) {
      console.log(i);
      console.log(JSON.stringify(arr));
      arr.splice(i, 1);
    }

    this.breadcrumbData = JSON.parse(JSON.stringify(arr));
    console.log(JSON.stringify(this.breadcrumbData));
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

  onLogout() {
    $('#logoutModal').modal('hide');
    this.commonService.onLogOut();
  }

}
