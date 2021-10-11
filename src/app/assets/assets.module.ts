import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AssetModelModule } from './../asset-models/asset-model.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { VisualizationModule } from './../visualization/visualization.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetListComponent } from './asset-list/asset-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTableModule } from '@angular/material/table';
import { GoogleMapsModule } from '@angular/google-maps';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { AssetControlPanelComponent } from './asset-control-panel/asset-control-panel.component';
import { OverviewComponent } from './asset-control-panel/overview/overview.component';
import { AccessControlComponent } from './asset-control-panel/access-control/access-control.component';
import { TagsComponent } from './asset-control-panel/tags/tags.component';
import { HeartbeatComponent } from './asset-control-panel/heartbeat/heartbeat.component';
import { NotificationComponent } from './asset-control-panel/notification/notification.component';
import { AlertsComponent } from './asset-control-panel/alerts/alerts.component';
import { TelemetryComponent } from './asset-control-panel/telemetry/telemetry.component';
import { CommandsComponent } from './asset-control-panel/commands/commands.component';
import { C2dPurgeComponent } from './asset-control-panel/c2d-purge/c2d-purge.component';
import { FilterComponent } from './asset-control-panel/filter/filter.component';
import { LiveDataComponent } from './asset-control-panel/live-data/live-data.component';
import { RDMAssetControlPanelErrorComponent } from './asset-control-panel/rdmasset-control-panel-error/rdmasset-control-panel-error.component';
import { TableComponent } from './asset-control-panel/table/table.component';
import { OthersComponent } from './asset-control-panel/others/others.component';
import { LogsComponent } from './asset-control-panel/logs/logs.component';
import { ComposeC2DMessageComponent } from './asset-control-panel/compose-c2d-message/compose-c2d-message.component';
import { TrendAnalysisComponent } from './asset-control-panel/trend-analysis/trend-analysis.component';
import { HistoryComponent } from './asset-control-panel/history/history.component';
import { C2dMessageComponent } from './asset-control-panel/c2d-message/c2d-message.component';
import { BatteryMessagesComponent } from './asset-control-panel/battery-messages/battery-messages.component';
import { CommonCustomModule } from './../common/common.module';
import { SpecificC2dMessageComponent } from './asset-control-panel/specific-c2d-message/specific-c2d-message.component';
import { GatewayControlPanelComponent } from './gateway-control-panel/gateway-control-panel.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { GatewayCachedTelemetryComponent } from './gateway-control-panel/gateway-cached-telemetry/gateway-cached-telemetry.component';
import { GatewayCachedAlertsComponent } from './gateway-control-panel/gateway-cached-alerts/gateway-cached-alerts.component';
import { AssetLifeCycleEventsComponent } from './gateway-control-panel/asset-life-cycle-events/asset-life-cycle-events.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { GatewayConfigurationHistoryComponent } from './gateway-control-panel/gateway-configuration-history/gateway-configuration-history.component';
import { GatewayCurrentConfigurationComponent } from './gateway-control-panel/gateway-current-configuration/gateway-current-configuration.component';
import { GatewaySettingsComponent } from './gateway-control-panel/gateway-settings/gateway-settings.component';
import { SpecificDirectMethodComponent } from './asset-control-panel/specific-direct-method/specific-direct-method.component';
import { SpecificTwinChangeComponent } from './asset-control-panel/specific-twin-change/specific-twin-change.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { AssetCountComponent } from './asset-control-panel/asset-count/asset-count.component';
import { AssetManagementComponent } from './asset-management/asset-management.component';
import { AssetManagementAssetsComponent } from './asset-management/asset-management-assets/asset-management-assets.component';
import { AddAssetComponent } from './add-asset/add-asset.component';
import { AssetMttrComponent } from './asset-control-panel/asset-mttr/asset-mttr.component';
import { AssetMtbfComponent } from './asset-control-panel/asset-mtbf/asset-mtbf.component';
import { AgmCoreModule } from '@agm/core';
import { RegisterPropertiesComponent } from './gateway-control-panel/gateway-settings/register-properties/register-properties.component';
import { ManageApplicationsComponent } from './gateway-control-panel/gateway-settings/manage-applications/manage-applications.component';
import { GatewayAssetsSettingComponent } from './gateway-control-panel/gateway-settings/gateway-assets-setting/gateway-assets-setting.component';
import { AssetPackagesComponent } from './asset-control-panel/asset-packages/asset-packages.component';
import { AssetMessagesWrapperComponent } from './asset-control-panel/asset-messages-wrapper/asset-messages-wrapper.component';
import { FotaComponent } from './gateway-control-panel/gateway-settings/fota/fota.component';
import { DerivedKpisComponent } from './asset-control-panel/derived-kpis/derived-kpis.component';
import { RulesComponent } from './asset-control-panel/rules/rules.component';
import { SlavesInfoComponent } from './asset-control-panel/slaves-info/slaves-info.component';
import { RegisterAssetsComponent } from './gateway-control-panel/gateway-settings/register-assets/register-assets.component';
import { AssetAlertConditionsComponent } from './asset-control-panel/asset-alert-conditions/asset-alert-conditions.component';
import { C2dJobsComponent } from './gateway-control-panel/gateway-settings/c2d-jobs/c2d-jobs.component';
import { CloudDerivedPropertiesComponent } from './asset-control-panel/cloud-derived-properties/cloud-derived-properties.component';
import { WorkProgressComponent } from './asset-control-panel/work-progress/work-progress.component';

@NgModule({
  declarations: [
    AssetListComponent,
    AssetControlPanelComponent,
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
    LiveDataComponent,
    RDMAssetControlPanelErrorComponent,
    TableComponent,
    OthersComponent,
    LogsComponent,
    ComposeC2DMessageComponent,
    TrendAnalysisComponent,
    HistoryComponent,
    C2dMessageComponent,
    BatteryMessagesComponent,
    SpecificC2dMessageComponent,
    GatewayControlPanelComponent,
    ControlPanelComponent,
    GatewayCachedTelemetryComponent,
    GatewayCachedAlertsComponent,
    AssetLifeCycleEventsComponent,
    GatewayConfigurationHistoryComponent,
    GatewayCurrentConfigurationComponent,
    GatewaySettingsComponent,
    SpecificDirectMethodComponent,
    SpecificTwinChangeComponent,
    AssetCountComponent,
    AssetManagementComponent,
    AssetManagementAssetsComponent,
    AddAssetComponent,
    AssetMttrComponent,
    AssetMtbfComponent,
    RegisterAssetsComponent,
    RegisterPropertiesComponent,
    ManageApplicationsComponent,
    GatewayAssetsSettingComponent,
    AssetPackagesComponent,
    AssetMessagesWrapperComponent,
    FotaComponent,
    DerivedKpisComponent,
    RulesComponent,
    SlavesInfoComponent,
    AssetAlertConditionsComponent,
    C2dJobsComponent,
    CloudDerivedPropertiesComponent,
    WorkProgressComponent,
  ],
  imports: [
    CommonModule,
    AssetsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    CommonCustomModule,
    GoogleMapsModule,
    UiSwitchModule,
    VisualizationModule,
    NgJsonEditorModule,
    AccordionModule.forRoot(),
    AgmCoreModule.forRoot({
      libraries: ['places'],
    }),
    AgmMarkerClustererModule,
    TabsModule,
    NgSelectModule,
    TooltipModule,
    AssetModelModule,
    NgxIntlTelInputModule,
  ],
  exports: [FilterComponent, TableComponent],
})
export class AssetsModule {}
