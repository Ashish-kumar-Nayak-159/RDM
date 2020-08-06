import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesRoutingModule } from './devices-routing.module';
import { DeviceListComponent } from './device-list/device-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';


import { DeviceControlPanelComponent } from './device-control-panel/device-control-panel.component';
import { OverviewComponent } from './device-control-panel/overview/overview.component';
import { AccessControlComponent } from './device-control-panel/access-control/access-control.component';
import { TagsComponent } from './device-control-panel/tags/tags.component';
import { HeartbeatComponent } from './device-control-panel/heartbeat/heartbeat.component';
import { NotificationComponent } from './device-control-panel/notification/notification.component';
import { AlertsComponent } from './device-control-panel/alerts/alerts.component';
import { TelemetryComponent } from './device-control-panel/telemetry/telemetry.component';
import { CommandsComponent } from './device-control-panel/commands/commands.component';
import { C2dPurgeComponent } from './device-control-panel/c2d-purge/c2d-purge.component';
import { FilterComponent } from './device-control-panel/filter/filter.component';
import { MessageModalComponent } from './device-control-panel/message-modal/message-modal.component';


@NgModule({
  declarations: [
    DeviceListComponent,
    DeviceControlPanelComponent,
    OverviewComponent,
    AccessControlComponent,
    TagsComponent,
    HeartbeatComponent,
    NotificationComponent,
    AlertsComponent,
    TelemetryComponent,
    CommandsComponent,
    C2dPurgeComponent,
    FilterComponent,
    MessageModalComponent
  ],
  imports: [
    CommonModule,
    DevicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule
  ],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
export class DevicesModule { }
