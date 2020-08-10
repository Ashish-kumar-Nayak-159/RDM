import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
declare var $: any;
@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  userData: any;
  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));

  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar-toggled'),
    $('.sidebar').toggleClass('toggled'),
    $('.sidebar').hasClass('toggled') &&
    $('.sidebar .collapse').collapse('hide');
    const body = this.document.body;
    const sidebar = this.document.getElementsByClassName('sidebar')[0];
    const containerDiv = this.document.getElementsByClassName('container-fluid')[0];
    if (
      body.classList.contains('sidebar-toggled') ||
      sidebar.classList.contains('toggled')
    ) {
      containerDiv.classList.remove('sb-notoggle');
      containerDiv.classList.add('sb-toggle');
    } else {
      containerDiv.classList.remove('sb-toggle');
      containerDiv.classList.add('sb-notoggle');
    }
  }

}
