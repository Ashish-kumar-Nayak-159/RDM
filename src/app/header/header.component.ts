import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
import { DOCUMENT } from '@angular/common';
declare var $:any;

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
    $("body").toggleClass("sidebar-toggled"),
    $(".sidebar").toggleClass("toggled"),
    $(".sidebar").hasClass("toggled") &&
    $(".sidebar .collapse").collapse("hide");
    const pageTop = this.document.getElementById('page-top');
    const containerDiv = this.document.getElementsByClassName('container-fluid')[0];
    if (pageTop.classList.contains("sidebar-toggled")) {
      containerDiv.classList.remove("sb-notoggle");
      containerDiv.classList.remove("sb-toggle");
      containerDiv.classList.add("sb-collapse");
    } else {
      containerDiv.classList.add("sb-toggle");
      containerDiv.classList.remove("sb-notoggle");
      containerDiv.classList.remove("sb-collapse");
    }
  }

  onLogout() {
    localStorage.removeItem('userData');
    $('#logoutModal').modal('hide');
    this.router.navigate(['login']);

  }

}
