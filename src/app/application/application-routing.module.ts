import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuardService } from './../services/auth-guard/auth-guard.service';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationSelectionComponent } from './application-selection/application-selection.component';
import { MapViewHomeComponent } from './map-view-home/map-view-home.component';
import { ApplicationGatewayMonitoringComponent } from './application-gateway-monitoring/application-gateway-monitoring.component';
import { ApplicationHistoricalLiveDataComponent } from './application-historical-live-data/application-historical-live-data.component';
import { ApplicationLogicalViewComponent } from './application-logical-view/application-logical-view.component';

const routes: Routes = [
  {
    path: 'selection',
    component: ApplicationSelectionComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':appName/gateway-monitoring',
    component: ApplicationGatewayMonitoringComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':appName/logicalView',
    component: ApplicationLogicalViewComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':appName/historical-live',
    component: ApplicationHistoricalLiveDataComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'gateway-monitoring',
    component: ApplicationGatewayMonitoringComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':applicationId',
    component: MapViewHomeComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: ':applicationId/settings',
    component: ApplicationSettingComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '',
    component: ApplicationListComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ApplicationRoutingModule { }
