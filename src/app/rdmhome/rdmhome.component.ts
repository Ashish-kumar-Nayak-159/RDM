import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rdmhome',
  templateUrl: './rdmhome.component.html',
  styleUrls: ['./rdmhome.component.css']
})
export class RDMHomeComponent implements OnInit {
  userData: any;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userData = JSON.parse(localStorage.getItem('userData'));
    console.log(localStorage.getItem('userData'));
    if (this.userData) {
      this.router.navigate(['applications', this.userData.app]);
    } else {
      this.router.navigate(['login']);
    }
  }

}
