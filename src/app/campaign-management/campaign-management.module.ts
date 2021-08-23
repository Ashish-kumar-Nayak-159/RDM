import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignManagementRoutingModule } from './campaign-management-routing.module';
import { CampaignManagementListComponent } from './campaign-management-list/campaign-management-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonCustomModule } from '../common/common.module';
import { Daterangepicker } from 'ng2-daterangepicker';


@NgModule({
  declarations: [CampaignManagementListComponent],
  imports: [
    CommonModule,
    CampaignManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule,
    TooltipModule,
    Daterangepicker
  ]
})
export class CampaignManagementModule { }
