import { environment } from 'src/environments/environment';
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
    const version = localStorage.getItem(CONSTANTS.APP_VERSION);
    if (version !== environment.version) {
      this.commonService.onLogOut();
      return false;
    }
    if (this.getResolvedUrl(route) === '/applications/' && !userData.is_super_admin) {
      this.commonService.onLogOut();
      return false;
    }
    if (this.getResolvedUrl(route)?.includes('selection')) {
      if (!userData) {
        this.commonService.onLogOut();
        return false;
      }
    } else if (!userData && !appData) {
      this.commonService.onLogOut();
      return false;
    }
    return true;
  }

  getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
        .map(v => v.url.map(segment => segment.toString()).join('/'))
        .join('/');
  }
}
