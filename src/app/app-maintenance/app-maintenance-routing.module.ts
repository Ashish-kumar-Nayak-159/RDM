import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../services/auth-guard/auth-guard.service';
import {AppMaintenanceListComponent} from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'
import { AngularEditorModule } from '@kolkov/angular-editor';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgSelectModule } from '@ng-select/ng-select';

const routes: Routes = [
  {
    path: '',
    component: AppMaintenanceListComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes),AngularEditorModule,OwlDateTimeModule,
    OwlNativeDateTimeModule,NgSelectModule],
  exports: [RouterModule]
})
export class AppMaintenanceRoutingModule { }
