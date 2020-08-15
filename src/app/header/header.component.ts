import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  breadcrumbData: string;
  userData: any;
  constructor(
    private router: Router,
    private commonService: CommonService,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    console.log(this.userData);
    this.commonService.breadcrumbEvent.subscribe(data => this.breadcrumbData = data);
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
