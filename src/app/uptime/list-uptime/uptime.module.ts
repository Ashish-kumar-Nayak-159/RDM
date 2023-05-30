import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from '../../common/common.module';
import { ListUptimeComponent } from './list-uptime.component';
import { UpTimeRoutingModule } from '../uptime-routing.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [ListUptimeComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    CommonCustomModule,
    TooltipModule,
    Daterangepicker,
    NgSelectModule,
    UiSwitchModule,
    UpTimeRoutingModule,
    MatDatepickerModule,
    MatInputModule,
  ],
})
export class UpTimeModule { }
