import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import {AppMaintenanceListComponent} from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'


const routes: Routes = [
  {
    path: '',
    component: AppMaintenanceListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppMaintenanceRoutingModule { }
