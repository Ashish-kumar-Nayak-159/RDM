import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { AuthGuardService } from './../services/auth-guard/auth-guard.service';

const routes: Routes = [
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
