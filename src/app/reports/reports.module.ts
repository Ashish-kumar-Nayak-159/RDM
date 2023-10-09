import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports/reports.component';
import { PreGeneratedReportsComponent } from './pre-generated-reports/pre-generated-reports.component';
import { CommonCustomModule } from '../common/common.module';
import { DailyReportsComponent } from './daily-reports/daily-reports.component';

@NgModule({
  declarations: [ReportsComponent, PreGeneratedReportsComponent, DailyReportsComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    UiSwitchModule,
    AccordionModule,
    TabsModule,
    NgSelectModule,
    TooltipModule,
    CommonCustomModule,
  ],
})
export class ReportsModule {}
