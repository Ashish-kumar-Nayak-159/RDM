import { DeviceTypeListComponent } from './device-type-list/device-type-list.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import { DeviceTypeControlPanelComponent } from './device-type-control-panel/device-type-control-panel.component';

const routes: Routes = [
  {
    path: '',
    component: DeviceTypeListComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':deviceTypeId/control-panel',
    component: DeviceTypeControlPanelComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceTypeRoutingModule { }
