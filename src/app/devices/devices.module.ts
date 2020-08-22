import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesRoutingModule } from './devices-routing.module';
import { DeviceListComponent } from './device-list/device-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';

import {MatTableModule} from '@angular/material/table';

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
import { SettingsComponent } from './device-control-panel/settings/settings.component';
import { LiveDataComponent } from './device-control-panel/live-data/live-data.component';
import { RDMDeviceControlPanelErrorComponent } from './device-control-panel/rdmdevice-control-panel-error/rdmdevice-control-panel-error.component';
import { TableComponent } from './device-control-panel/table/table.component';
import { OthersComponent } from './device-control-panel/others/others.component';
import { LogsComponent } from './device-control-panel/logs/logs.component';
import { ComposeC2DMessageComponent } from './device-control-panel/compose-c2d-message/compose-c2d-message.component';
import { TrendAnalysisComponent } from './device-control-panel/trend-analysis/trend-analysis.component';
import { HistoryComponent } from './device-control-panel/history/history.component';
import { C2dMessageComponent } from './device-control-panel/c2d-message/c2d-message.component';
import { ChartsModule } from 'ng2-charts';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { NgSelectModule } from '@ng-select/ng-select';
import { BatteryMessagesComponent } from './device-control-panel/battery-messages/battery-messages.component';


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
    MessageModalComponent,
    SettingsComponent,
    LiveDataComponent,
    RDMDeviceControlPanelErrorComponent,
    OthersComponent,
    LogsComponent,
    ComposeC2DMessageComponent,
    TrendAnalysisComponent,
    HistoryComponent,
    C2dMessageComponent,
    BatteryMessagesComponent
  ],
  imports: [
    CommonModule,
    DevicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    NgSelectModule,
    ChartsModule,
    Ng2GoogleChartsModule,
  ]
})
export class DevicesModule { }
