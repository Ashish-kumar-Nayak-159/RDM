import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { AuthGuardService } from './../services/auth-guard/auth-guard.service';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationNotificationComponent } from './application-notification/application-notification.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationListComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':applicationId',
    component: ApplicationDashboardComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':applicationId/settings',
    component: ApplicationSettingComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':applicationId/notifications',
    component: ApplicationNotificationComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
