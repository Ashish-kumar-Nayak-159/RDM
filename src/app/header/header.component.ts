import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
import { CONSTANTS } from '../app.constants';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  breadcrumbData: any;
  userData: any;
  constructor(
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.commonService.breadcrumbEvent.subscribe(data => this.breadcrumbData = data);
   }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
  }

  onSideBarToggleTopClick() {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("hide");
      $(".container-fluid").addClass("sb-collapse");
      $(".container-fluid").removeClass("sb-toggle");
    }
    if (!$(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("show");
      $(".container-fluid").removeClass("sb-collapse");
      $(".container-fluid").addClass("sb-toggle");
    }
  }

  onLogout() {
    localStorage.removeItem('userData');
    $('#logoutModal').modal('hide');
    this.router.navigate(['login']);

  }

}
