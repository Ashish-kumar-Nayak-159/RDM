import { AssetManagementComponent } from './asset-management/asset-management.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AssetListComponent } from './asset-list/asset-list.component';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: AssetListComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'management',
    component: AssetManagementComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':assetId/control-panel',
    component: ControlPanelComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsRoutingModule {}
