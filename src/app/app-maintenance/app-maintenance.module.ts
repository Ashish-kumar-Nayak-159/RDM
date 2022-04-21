import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppMaintenanceListComponent}from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'
import { AppMaintenanceRoutingModule } from './app-maintenance-routing.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule } from '@angular/forms';
import { CommonCustomModule } from '../common/common.module';


@NgModule({
  declarations: [AppMaintenanceListComponent],
  imports: [
    CommonModule,
    AppMaintenanceRoutingModule,
    TooltipModule,
    FormsModule,
    CommonCustomModule
    
  ]
})
export class AppMaintenanceModule { }
