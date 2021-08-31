import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { CampaignManagementListComponent } from './campaign-management-list/campaign-management-list.component';


const routes: Routes = [
  {
    path: '',
    component: CampaignManagementListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CampaignManagementRoutingModule { }
