import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rdmhome',
  templateUrl: './rdmhome.component.html',
  styleUrls: ['./rdmhome.component.css']
})
export class RDMHomeComponent implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(localStorage.getItem('userData'));
    if (localStorage.getItem('userData')) {
      this.router.navigate(['applications', 'ccd']);
    } else {
      this.router.navigate(['login']);
    }
  }

}
