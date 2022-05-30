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
import { AppMaintenanceModalComponent } from './app-maintenance-modal/app-maintenance-modal.component';
import { AppViewAcknowledgeModalComponent } from './app-view-acknowledge-modal/app-view-acknowledge-modal.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
@NgModule({
  declarations: [AppMaintenanceListComponent, TextEditorComponent,AppMaintenanceModalComponent,AppViewAcknowledgeModalComponent],
  imports: [
    CommonModule,
    AppMaintenanceRoutingModule,
    TooltipModule,
    FormsModule,
    CommonCustomModule,
    AngularEditorModule,
    NgSelectModule,
    ReactiveFormsModule,
    AccordionModule  
  ]
})
export class AppMaintenanceModule { }
