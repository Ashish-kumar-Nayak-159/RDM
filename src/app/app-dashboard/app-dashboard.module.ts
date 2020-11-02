import { GoogleMapsModule } from '@angular/google-maps';
import { DevicesModule } from './../devices/devices.module';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { CommonCustomModule } from './../common/common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppDashboardRoutingModule } from './app-dashboard-routing.module';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { EScooterTrackerDashboardComponent } from './app-dashboard/e-scooter-tracker-dashboard/e-scooter-tracker-dashboard.component';
import { WaterTankMonitorComponent } from './app-dashboard/water-tank-monitor/water-tank-monitor.component';
import { FormsModule } from '@angular/forms';
import { PumpDashboardComponent } from './app-dashboard/pump-dashboard/pump-dashboard.component';


@NgModule({
  declarations: [AppDashboardComponent, EScooterTrackerDashboardComponent, WaterTankMonitorComponent, PumpDashboardComponent],
  imports: [
    CommonModule,
    AppDashboardRoutingModule,
    CommonCustomModule,
    Ng2GoogleChartsModule,
    GoogleMapsModule,
    DevicesModule,
    FormsModule
  ]
})
export class AppDashboardModule { }
