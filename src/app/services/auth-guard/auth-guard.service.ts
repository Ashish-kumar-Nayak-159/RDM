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
    const app = route.paramMap.get('applicationId');
    const userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS)
    if (!userData) {
      this.commonService.onLogOut();
      return false;
    } else if (userData && !userData.is_super_admin && route.paramMap.get('applicationId')) {
      let appFound = false;
      userData.apps.forEach(appObj => {
        if (appObj.app === app) {
          appFound = true;
        }
      });
      if (!appFound) {
        this.commonService.onLogOut();
        return false;
      }
    }
    return true;
  }
}
