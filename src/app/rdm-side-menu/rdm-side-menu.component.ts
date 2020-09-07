import { Component, OnInit, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css']
})
export class RDMSideMenuComponent implements OnInit, OnChanges {

  userData: any;
  @Input() appName = '';
  constantsData = CONSTANTS;
  appData: any;
  predictiveDemoUrl = 'https://app.powerbi.com/view?r=eyJrIjoiMzUyOWE3MmUtZWJhYi00NzA5LWI1YjktMTMwZDg1NjJiNmY2IiwidCI6IjA4YjdjZmViLTg5N2UtNDY5Yi05NDM2LTk3NGU2OTRhOGRmMiJ9&pageName=ReportSection';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private commonService: CommonService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.appData = this.userData.apps.filter(app => app.app === this.appName)[0];
    console.log(this.appData);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userData) {
      this.appData = this.userData.apps.filter(app => app.app === this.appName)[0];
    }
  }

  onSidebarToggle() {
    $('body').toggleClass('sidebar-toggled');
    $('.sidebar').toggleClass('toggled');
    if ($('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("hide");
      $('.container-fluid').removeClass('sb-notoggle');
      $('.container-fluid').addClass('sb-toggle');
    }
    if (!$('.sidebar').hasClass('toggled')) {
      // $(".sidebar .collapse").collapse("show");
      $('.container-fluid').addClass('sb-notoggle');
      $('.container-fluid').removeClass('sb-toggle');
    }
  }

}
