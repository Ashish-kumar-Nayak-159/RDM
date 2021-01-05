import { ControlPanelComponent } from './control-panel/control-panel.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceListComponent } from './device-list/device-list.component';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: DeviceListComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: ':deviceId/control-panel',
    component: ControlPanelComponent,
    canActivate: [AuthGuardService]
  }
];

 @NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevicesRoutingModule { }
