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
    path: 'applications/:applicationId/:listName',
    loadChildren: () => import('./devices/devices.module').then(module => module.DevicesModule),
  },
  {
    path: 'applications/:applicationId/visualization',
    loadChildren: () => import('./visualization/visualization.module').then(module => module.VisualizationModule)
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
