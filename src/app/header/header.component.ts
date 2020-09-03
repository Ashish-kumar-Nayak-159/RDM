import { Component, OnInit, Inject, Input, SimpleChanges, OnChanges } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
import { CONSTANTS } from '../app.constants';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnChanges {
  breadcrumbData: any;
  userData: any;
  @Input() appName = '';
  @Input() isLoginRoute = false;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.commonService.breadcrumbEvent.subscribe(data => this.breadcrumbData = data);
   }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
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
