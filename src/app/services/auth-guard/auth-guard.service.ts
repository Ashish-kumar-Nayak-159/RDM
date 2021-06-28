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
    const resolvedRoute = this.getResolvedUrl(route);
    console.log(resolvedRoute);
    if (appData) {
    if (resolvedRoute?.includes(appData.app) || resolvedRoute?.includes('selection')) {
    if (resolvedRoute === '/applications/' && !userData.is_super_admin) {
      this.commonService.onLogOut();
      return false;
    }
    if (resolvedRoute?.includes('selection')) {
      if (!userData) {
        this.commonService.onLogOut();
        return false;
      }
    } else if (!userData && !appData) {
      this.commonService.onLogOut();
      return false;
    }
    return true;
    } else {
      this.router.navigate(['applications', appData.app]);
      setTimeout(() => {
        location.reload();
      }, 500);

    }
    } else {
      return true;
    }
  }

  getResolvedUrl(route: ActivatedRouteSnapshot): string {
    return route.pathFromRoot
        .map(v => v.url.map(segment => segment.toString()).join('/'))
        .join('/');
  }
}
