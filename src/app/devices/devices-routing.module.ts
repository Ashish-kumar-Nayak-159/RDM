import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceControlPanelComponent } from './device-control-panel/device-control-panel.component';

const routes: Routes = [
  {
    path: '',
    component: DeviceListComponent
  },
  {
    path: ':deviceId/control-panel',
    component: DeviceControlPanelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

exports: [RouterModule]
})
export class DevicesRoutingModule { }
