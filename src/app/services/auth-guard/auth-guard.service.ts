import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from './../../app.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    public router: Router,
    private commonService: CommonService
  ) {}
  canActivate(): boolean {
    if (!this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS)) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }
}
