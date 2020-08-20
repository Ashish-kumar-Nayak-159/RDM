import { Component, OnInit } from '@angular/core';
import { CommonService } from './../../services/common.service';
import { CONSTANTS } from './../../app.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit {

  userData: any;
  applicationFilterObj: any = {};
  applications: any[] = [];
  isApplicationListLoading = false;
  constructor(
    private commonService: CommonService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.commonService.breadcrumbEvent.emit({
      data: [
        {
          title: 'Applications',
          url: 'applications'
        }
      ]
    });
    this.searchApplications();
  }

  searchApplications() {
    this.applications = [
      {
        app_name: 'ccd',
        app_admin: 'sombabu@kemsys.com'
      },
      {
        app_name: 'IDEX',
        app_admin: 'urvisha@kemsys.com'
      },
      {
        app_name: 'Adani',
        app_admin: 'yash@kemsys.com'
      }
    ];
  }

  clearFilter() {
    this.applicationFilterObj = {};
  }

  redirectToDevices(app) {
    this.userData.app = app.app_name;
    this.commonService.setItemInLocalStorage(CONSTANTS.USER_DETAILS, JSON.stringify(this.userData));
    this.router.navigate(['applications', app.app_name, 'devices']);
  }

}
