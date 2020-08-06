import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
  }

  onSidebarToggle() {
    console.log(this.document.body.classList.length);
    if (!this.document.body.classList.contains('sidebar-toggled')) {
      this.document.body.classList.add('sidebar-toggled');
    } else {
      this.document.body.classList.remove('sidebar-toggled');
    }
    const elem = this.document.getElementById('accordionSidebar');
    if (!elem.classList.contains('toggled')) {
      elem.classList.add('toggled');
    } else {
      elem.classList.remove('toggled');
    }
  }

}
