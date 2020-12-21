import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
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
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

    const userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    const appData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    console.log('user    ', userData);
    console.log('apppp   ', appData);
    if (!userData && !appData) {
      this.commonService.onLogOut();
      return false;
    }
    return true;
  }
}
