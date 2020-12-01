import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { RDMLoginComponent } from './rdm-login/rdm-login.component';
import { RDMHomeComponent } from './rdmhome/rdmhome.component';

const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () => import('./application/application.module').then(module => module.ApplicationModule)
  },
  {
    path: 'applications/:applicationId/data/visualization',
    loadChildren: () => import('./visualization/visualization.module').then(module => module.VisualizationModule)
  },
  {
    path: 'applications/:applicationId/things/model',
    loadChildren: () => import('./device-type/device-type.module').then(module => module.DeviceTypeModule)
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
    path: 'applications/:applicationId/:listName',
    loadChildren: () => import('./devices/devices.module').then(module => module.DevicesModule),
  },
  {
    path: 'login',
    component: RDMLoginComponent
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
