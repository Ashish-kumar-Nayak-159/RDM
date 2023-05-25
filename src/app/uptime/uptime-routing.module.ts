import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { ListUptimeComponent } from './list-uptime/list-uptime.component';


const routes: Routes = [
  {
    path: '',
    component: ListUptimeComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UpTimeRoutingModule { }
