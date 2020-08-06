import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';

import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';


@NgModule({
  declarations: [ApplicationDashboardComponent],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    ChartsModule
  ]
})
export class ApplicationModule { }
