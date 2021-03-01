import { ApplicationEventsComponent } from './application-events/application-events.component';
import { ApplicationAlertsComponent } from './application-alerts/application-alerts.component';
import { ApplicationNotificationsComponent } from './application-notifications/application-notifications.component';
import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { AuthGuardService } from './../services/auth-guard/auth-guard.service';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationSelectionComponent } from './application-selection/application-selection.component';

const routes: Routes = [

  {
    path: 'selection',
    component: ApplicationSelectionComponent,
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
    component: ApplicationNotificationsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':applicationId/alerts',
    component: ApplicationAlertsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':applicationId/events',
    component: ApplicationEventsComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: '',
    component: ApplicationListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
