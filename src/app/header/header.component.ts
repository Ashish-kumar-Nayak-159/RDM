import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
declare var $:any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userData: any;
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    console.log(this.userData);
  }

  onLogout() {
    localStorage.removeItem('userData');
    $('#logoutModal').modal('hide');
    this.router.navigate(['login']);

  }

}
