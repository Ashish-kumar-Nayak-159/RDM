import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CampaignManagementRoutingModule } from './campaign-management-routing.module';
import { CampaignManagementListComponent } from './campaign-management-list/campaign-management-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { AddCampaignComponent } from './add-campaign/add-campaign.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from '../common/common.module';

@NgModule({
  declarations: [CampaignManagementListComponent, AddCampaignComponent],
  imports: [
    CommonModule,
    CampaignManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    CommonCustomModule,
    TooltipModule,
    Daterangepicker,
    NgSelectModule,
    UiSwitchModule    
  ],
})
export class CampaignManagementModule {}
