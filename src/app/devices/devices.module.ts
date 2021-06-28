import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { VisualizationModule } from './../visualization/visualization.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicesRoutingModule } from './devices-routing.module';
import { DeviceListComponent } from './device-list/device-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule} from '@angular/material-moment-adapter';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import {MatTableModule} from '@angular/material/table';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { GoogleMapsModule } from '@angular/google-maps';
import { UiSwitchModule } from 'ngx-ui-switch';
import { Daterangepicker } from 'ng2-daterangepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

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
import { BatteryMessagesComponent } from './device-control-panel/battery-messages/battery-messages.component';
import { CommonCustomModule } from './../common/common.module';
import { SpecificC2dMessageComponent } from './device-control-panel/specific-c2d-message/specific-c2d-message.component';
import { PredictiveMaintenanceComponent } from './device-control-panel/predictive-maintenance/predictive-maintenance.component';
import { AlertEndEventComponent } from './device-control-panel/alert-end-event/alert-end-event.component';
import { GatewayControlPanelComponent } from './gateway-control-panel/gateway-control-panel.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { GatewayCachedTelemetryComponent } from './gateway-control-panel/gateway-cached-telemetry/gateway-cached-telemetry.component';
import { GatewayCachedAlertsComponent } from './gateway-control-panel/gateway-cached-alerts/gateway-cached-alerts.component';
import { DeviceLifeCycleEventsComponent } from './gateway-control-panel/device-life-cycle-events/device-life-cycle-events.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { GatewayConfigurationHistoryComponent } from './gateway-control-panel/gateway-configuration-history/gateway-configuration-history.component';
import { GatewayCurrentConfigurationComponent } from './gateway-control-panel/gateway-current-configuration/gateway-current-configuration.component';
import { GatewaySettingsComponent } from './gateway-control-panel/gateway-settings/gateway-settings.component';
import { SpecificDirectMethodComponent } from './device-control-panel/specific-direct-method/specific-direct-method.component';
import { SpecificTwinChangeComponent } from './device-control-panel/specific-twin-change/specific-twin-change.component';
import { DeviceMaintenanceComponent } from './device-control-panel/device-maintenance/device-maintenance.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { DeviceCountComponent } from './device-control-panel/device-count/device-count.component';
import { DeviceManagementComponent } from './device-management/device-management.component';
import { DeviceManagementDevicesComponent } from './device-management/device-management-devices/device-management-devices.component';
import { AddDeviceComponent } from './add-device/add-device.component';
import { DeviceMttrComponent } from './device-control-panel/device-mttr/device-mttr.component';
import { DeviceMtbfComponent } from './device-control-panel/device-mtbf/device-mtbf.component';
import { AgmCoreModule } from '@agm/core';
import { RuleEngineComponent } from './device-control-panel/rule-engine/rule-engine.component';
import { RegisterDevicesComponent } from './gateway-control-panel/gateway-settings/register-devices/register-devices.component';
import { RegisterPropertiesComponent } from './gateway-control-panel/gateway-settings/register-properties/register-properties.component';
import { ManageApplicationsComponent } from './gateway-control-panel/gateway-settings/manage-applications/manage-applications.component';
import { GatewayDevicesSettingComponent } from './gateway-control-panel/gateway-settings/gateway-devices-setting/gateway-devices-setting.component';
import { DevicePackagesComponent } from './device-control-panel/device-packages/device-packages.component';
import { DeviceMessagesWrapperComponent } from './device-control-panel/device-messages-wrapper/device-messages-wrapper.component';
import { FotaComponent } from './gateway-control-panel/gateway-settings/fota/fota.component';
import { DerivedKpisComponent } from './device-control-panel/derived-kpis/derived-kpis.component';

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
    MessageModalComponent,
    SettingsComponent,
    LiveDataComponent,
    RDMDeviceControlPanelErrorComponent,
    TableComponent,
    OthersComponent,
    LogsComponent,
    ComposeC2DMessageComponent,
    TrendAnalysisComponent,
    HistoryComponent,
    C2dMessageComponent,
    BatteryMessagesComponent,
    SpecificC2dMessageComponent,
    PredictiveMaintenanceComponent,
    AlertEndEventComponent,
    GatewayControlPanelComponent,
    ControlPanelComponent,
    GatewayCachedTelemetryComponent,
    GatewayCachedAlertsComponent,
    DeviceLifeCycleEventsComponent,
    GatewayConfigurationHistoryComponent,
    GatewayCurrentConfigurationComponent,
    GatewaySettingsComponent,
    SpecificDirectMethodComponent,
    SpecificTwinChangeComponent,
    DeviceMaintenanceComponent,
    DeviceCountComponent,
    DeviceManagementComponent,
    DeviceManagementDevicesComponent,
    AddDeviceComponent,
    DeviceMttrComponent,
    DeviceMtbfComponent,
    RuleEngineComponent,
    RegisterDevicesComponent,
    RegisterPropertiesComponent,
    ManageApplicationsComponent,
    GatewayDevicesSettingComponent,
    DevicePackagesComponent,
    DeviceMessagesWrapperComponent,
    FotaComponent,
    DerivedKpisComponent
  ],
  imports: [
    CommonModule,
    DevicesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    AngularMultiSelectModule,
    CommonCustomModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    GoogleMapsModule,
    UiSwitchModule,
    VisualizationModule,
    NgJsonEditorModule,
    AccordionModule.forRoot(),
    AgmCoreModule.forRoot({
      libraries: ['places']
    }),
    AgmMarkerClustererModule,
    TabsModule,
    NgSelectModule,
    Daterangepicker,
    TooltipModule
  ],
  exports: [
    FilterComponent,
    TableComponent
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: {useUtc: true}}
  ]
})
export class DevicesModule { }
