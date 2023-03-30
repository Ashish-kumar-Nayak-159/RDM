import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { LogicalAssetComponent } from './logical-asset.component';


const routes: Routes = [
  {
    path: '',
    component: LogicalAssetComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogicalAssetRoutingModule { }
