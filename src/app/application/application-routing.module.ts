import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';

const routes: Routes = [
  {
    path: ':applicationId',
    component: ApplicationDashboardComponent
  },
  {
    path: ':applicationId/devices',
    loadChildren: () => import('../devices/devices.module').then(module => module.DevicesModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

exports: [RouterModule]
})
export class ApplicationRoutingModule { }
