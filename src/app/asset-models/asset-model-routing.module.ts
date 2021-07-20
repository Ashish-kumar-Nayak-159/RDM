import { AssetModelListComponent } from './asset-model-list/asset-model-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { AssetModelControlPanelComponent } from './asset-model-control-panel/asset-model-control-panel.component';

const routes: Routes = [
  {
    path: '',
    component: AssetModelListComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':assetModelId/control-panel',
    component: AssetModelControlPanelComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetModelRoutingModule { }
