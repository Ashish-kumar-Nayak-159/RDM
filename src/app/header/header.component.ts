import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../services/common.service';
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
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    console.log(this.userData);
    this.commonService.breadcrumbEvent.subscribe(data => this.breadcrumbData = data);
  }

  onLogout() {
    localStorage.removeItem('userData');
    $('#logoutModal').modal('hide');
    this.router.navigate(['login']);

  }

}
