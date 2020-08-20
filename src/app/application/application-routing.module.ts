import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { AuthGuardService } from './../services/auth-guard/auth-guard.service';
import { ApplicationListComponent } from './application-list/application-list.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationRoutingModule { }
