import { environment } from 'src/environments/environment';
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { RDMLoginComponent } from './rdm-login/rdm-login.component';
import { RdmGuestLoginComponent } from './rdm-guest-login/rdm-guest-login.component';
import { RDMHomeComponent } from './rdmhome/rdmhome.component';
import { Component } from '@angular/core';
import { ApplicationGatewayMonitoringComponent } from './application/application-gateway-monitoring/application-gateway-monitoring.component';
const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () => import('./application/application.module').then((module) => module.ApplicationModule),
  },
  {
    path: 'applications/:applicationId/campaigns',
    loadChildren: () =>
      import('./campaign-management/campaign-management.module').then((module) => module.CampaignManagementModule),
  },
  {
    path: 'applications/:applicationId/logical-asset',
    loadChildren: () =>
      import('./logical-asset/logical-asset.module').then((module) => module.LogicalAssetModule),
  },
  {
    path: 'applications/:applicationId/maintenance',
    loadChildren: () =>
      import('./app-maintenance/app-maintenance.module').then((module) => module.AppMaintenanceModule),
  },
  {
    path: 'applications/:applicationId/alerts/visualization',
    loadChildren: () => import('./visualization/visualization.module').then((module) => module.VisualizationModule),
  },
  {
    path: 'applications/:applicationId/assets/model',
    loadChildren: () => import('./asset-models/asset-model.module').then((module) => module.AssetModelModule),
  },
  {
    path: 'applications/:applicationId/dashboard',
    loadChildren: () => import('./app-dashboard/app-dashboard.module').then((module) => module.AppDashboardModule),
  },
  {
    path: 'applications/:applicationId/historical-trend',
    loadChildren: () => import('./app-dashboard/app-dashboard.module').then((module) => module.AppDashboardModule),
  },
  
  {
    path: 'applications/:applicationId/reports',
    loadChildren: () => import('./reports/reports.module').then((module) => module.ReportsModule),
  },
  // {
  //   path: 'applications/:applicationId/asset',
  //   loadChildren: () => import('./assets/assets.module').then((module) => module.AssetsModule),
  // },
  {
    path: 'applications/:applicationId/assets',
    loadChildren: () => import('./assets/assets.module').then((module) => module.AssetsModule),
  },
  {
    path: 'login',
    component: RDMLoginComponent,
  },
  {
    path: 'login/:tenantId',
    component: RDMLoginComponent,
  },
  // {
  //   path: ':tenantId/guest-login',
  //   component: RdmGuestLoginComponent,
  // },
];
const environmentObj = environment;
if (environmentObj.redirectToLogin) {
  routes.push({
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  });
} else {
  routes.push({
    path: '',
    component: RDMHomeComponent,
  });
}

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
