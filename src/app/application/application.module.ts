import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationNotificationComponent } from './application-notification/application-notification.component';


@NgModule({
  declarations: [ApplicationDashboardComponent, ApplicationListComponent, ApplicationNotificationComponent],
  imports: [
  CommonModule,
    ApplicationRoutingModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ApplicationModule { }
