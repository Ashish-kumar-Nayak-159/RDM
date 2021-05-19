import { FormsModule } from '@angular/forms';
import { VisualizationModule } from './../visualization/visualization.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { DevicesModule } from './../devices/devices.module';
import { CommonCustomModule } from './../common/common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppDashboardRoutingModule } from './app-dashboard-routing.module';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [AppDashboardComponent],
  imports: [
    CommonModule,
    AppDashboardRoutingModule,
    CommonCustomModule,
    GoogleMapsModule,
    DevicesModule,
    FormsModule,
    VisualizationModule,
    UiSwitchModule,
    NgSelectModule
  ]
})
export class AppDashboardModule { }
