import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RDMHomeComponent } from './rdmhome/rdmhome.component';

const routes: Routes = [
  {
    path: 'applications',
    loadChildren: () => import('./application/application.module').then(module => module.ApplicationModule)
  },
  // {
  //   path: 'devices',
  //   loadChildren: () => import('./devices/devices.module').then(module => {
  //     console.log('hereee    ', module);
  //     return module.DevicesModule})
  // },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: RDMHomeComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
  preloadingStrategy: PreloadAllModules
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
