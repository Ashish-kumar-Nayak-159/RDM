import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ApplicationVisualizationComponent } from './application-visualization/application-visualization.component';
import { AuthGuardService } from './../services/auth-guard/auth-guard.service';

const routes: Routes = [
  {
    path: '',
    component: ApplicationVisualizationComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VisualizationRoutingModule { }
