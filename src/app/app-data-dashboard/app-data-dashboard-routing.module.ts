import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { AppDataDashboardComponent } from './app-data-dashboard/app-data-dashboard.component';


const routes: Routes = [
  {
    path: '',
    component: AppDataDashboardComponent,
    canActivate: [AuthGuardService]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppDataDashboardRoutingModule { }
