import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppMaintenanceListComponent}from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'
import { AppMaintenanceRoutingModule } from './app-maintenance-routing.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonCustomModule } from '../common/common.module';
import { AppMaintenanceModalComponent } from './app-maintenance-modal/app-maintenance-modal.component';


@NgModule({
  declarations: [AppMaintenanceListComponent, AppMaintenanceModalComponent],
  imports: [
    CommonModule,
    AppMaintenanceRoutingModule,
    TooltipModule,
    FormsModule,
    CommonCustomModule,
    ReactiveFormsModule
  ]
})
export class AppMaintenanceModule { }
