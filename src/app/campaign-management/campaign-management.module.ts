import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignManagementRoutingModule } from './campaign-management-routing.module';
import { CampaignManagementListComponent } from './campaign-management-list/campaign-management-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonCustomModule } from '../common/common.module';
import { Daterangepicker } from 'ng2-daterangepicker';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [CampaignManagementListComponent, AddCampaignComponent],
  imports: [
    CommonModule,
    CampaignManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule,
    TooltipModule,
    Daterangepicker,
    NgSelectModule
  ]
})
export class CampaignManagementModule { }
