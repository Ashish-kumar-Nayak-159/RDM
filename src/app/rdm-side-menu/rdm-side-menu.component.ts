import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
})
export class RDMSideMenuComponent implements OnInit {

  userData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));

  }

  onSidebarToggle() {
    $("body").toggleClass("sidebar-toggled");
    $(".sidebar").toggleClass("toggled");
    if ($(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("hide");
      $(".container-fluid").removeClass("sb-notoggle");
      $(".container-fluid").addClass("sb-toggle");
    }
    if (!$(".sidebar").hasClass("toggled")) {
      $(".sidebar .collapse").collapse("show");
      $(".container-fluid").addClass("sb-notoggle");
      $(".container-fluid").removeClass("sb-toggle");
    }
  }

}
