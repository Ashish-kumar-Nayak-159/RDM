import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppMaintenanceListComponent}from './app-maintenance-list/app-maintenance-list/app-maintenance-list.component'
import { AppMaintenanceRoutingModule } from './app-maintenance-routing.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonCustomModule } from '../common/common.module';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [AppMaintenanceListComponent, TextEditorComponent],
  imports: [
    CommonModule,
    AppMaintenanceRoutingModule,
    TooltipModule,
    FormsModule,
    CommonCustomModule,
    AngularEditorModule,
    NgSelectModule,
    ReactiveFormsModule
  ]
})
export class AppMaintenanceModule { }
