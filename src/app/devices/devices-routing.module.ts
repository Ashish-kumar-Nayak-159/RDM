import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceControlPanelComponent } from './device-control-panel/device-control-panel.component';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: 'devices',
    component: DeviceListComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'devices/:deviceId/control-panel',
    component: DeviceControlPanelComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevicesRoutingModule { }
