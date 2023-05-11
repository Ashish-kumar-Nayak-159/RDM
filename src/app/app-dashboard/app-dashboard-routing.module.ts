import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { AppDashboardHistoricalComponent } from './app-dashboard-historical/app-dashboard-historical.component';


const routes: Routes = [
  {
    path: '',
    component: AppDashboardComponent,
    canActivate: [AuthGuardService]
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppDashboardRoutingModule { }
