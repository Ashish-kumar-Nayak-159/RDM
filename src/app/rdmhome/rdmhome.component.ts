import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CONSTANTS } from '../app.constants';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-rdmhome',
  templateUrl: './rdmhome.component.html',
  styleUrls: ['./rdmhome.component.css']
})
export class RDMHomeComponent implements OnInit {
  userData: any;

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    if (this.userData) {
      this.router.navigate(['applications', this.userData.app]);
    } else {
      this.router.navigate(['login']);
    }
  }

}
