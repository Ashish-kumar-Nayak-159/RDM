import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from '../app.constants';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
})
export class RDMSideMenuComponent implements OnInit {

  userData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);

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
