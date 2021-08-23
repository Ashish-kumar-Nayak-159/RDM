import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { RDMLoginComponent } from './rdm-login/rdm-login.component';
import { RdmGuestLoginComponent } from './rdm-guest-login/rdm-guest-login.component';
import { RDMHomeComponent } from './rdmhome/rdmhome.component';

const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () => import('./application/application.module').then(module => module.ApplicationModule)
  },
  {
    path: 'applications/:applicationId/alerts/visualization',
    loadChildren: () => import('./visualization/visualization.module').then(module => module.VisualizationModule)
  },
  {
    path: 'applications/:applicationId/assets/model',
    loadChildren: () => import('./asset-models/asset-model.module').then(module => module.AssetModelModule)
  },
  {
    path: 'applications/:applicationId/dashboard',
    loadChildren: () => import('./app-dashboard/app-dashboard.module').then(module => module.AppDashboardModule)
  },
  {
    path: 'applications/:applicationId/reports',
    loadChildren: () => import('./reports/reports.module').then(module => module.ReportsModule)
  },
  {
    path: 'applications/:applicationId/asset',
    loadChildren: () => import('./assets/assets.module').then(module => module.AssetsModule),
  },
  {
    path: 'applications/:applicationId/assets',
    loadChildren: () => import('./assets/assets.module').then(module => module.AssetsModule),
  },
  {
    path: 'applications/:applicationId/campaigns',
    loadChildren: () => import('./campaign-management/campaign-management.module').then(module => module.CampaignManagementModule),
  },
  {
    path: 'login',
    component: RDMLoginComponent
  },
  {
    path: ':tenantId/guest-login',
    component: RdmGuestLoginComponent
  },
  {
    path: '',
    component: RDMHomeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
