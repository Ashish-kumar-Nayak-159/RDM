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
import { AppEscalationModalComponent } from './app-escalation-modal/app-escalation-modal.component';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@NgModule({
  declarations: [AppMaintenanceListComponent, TextEditorComponent,AppMaintenanceModalComponent,AppViewAcknowledgeModalComponent, AppEscalationModalComponent],
  imports: [
    CommonModule,
    AppMaintenanceRoutingModule,
    TooltipModule,
    FormsModule,
    CommonCustomModule,
    AngularEditorModule,
    NgSelectModule,
    ReactiveFormsModule,
    AccordionModule,
    CommonCustomModule,
    BsDatepickerModule.forRoot(),
 
  ],
  providers: [BsDatepickerConfig],
  exports:[
    AppMaintenanceListComponent,
  ]
})
export class AppMaintenanceModule { }
