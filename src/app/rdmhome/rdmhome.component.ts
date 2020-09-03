import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '../app.constants';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;
@Component({
  selector: 'app-rdmhome',
  templateUrl: './rdmhome.component.html',
  styleUrls: ['./rdmhome.component.css']
})
export class RDMHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  userData: any;
  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    console.log(this.userData);
    if (this.userData) {
      if (this.userData.is_super_admin) {
        this.router.navigate(['applications']);
      } else {
        if (this.userData.apps && this.userData.apps.length > 0) {
          this.router.navigate(['applications', this.userData.apps[0].app]);
        }
      }
    }
  }

  ngAfterViewInit(): void {
    $('body').css({'overflow-y': 'auto'});
    if ($('body').hasClass('sb-notoggle')) {
      $('body').removeClass('sb-notoggle');
    }
    if ($('body').hasClass('sb-toggle')) {
      $('body').removeClass('sb-toggle');
    }
    if ($('#container-fluid-div').hasClass('sb-notoggle')) {
      console.log('in sb-notoggle');
      $('#container-fluid-div').removeClass('sb-notoggle');
    }
  }

  ngOnDestroy(): void {
    $('body').css({'overflow-y': ''});
  }

}
