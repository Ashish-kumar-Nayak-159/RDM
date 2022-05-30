import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import {AppMaintenanceListComponent} from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'
import { AngularEditorModule } from '@kolkov/angular-editor';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: AppMaintenanceListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),FormsModule,ReactiveFormsModule,AngularEditorModule,NgSelectModule],
  exports: [RouterModule]
})
export class AppMaintenanceRoutingModule { }
