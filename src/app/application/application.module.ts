import { NgSelectModule } from '@ng-select/ng-select';
import { AgmCoreModule } from '@agm/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from './../common/common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { ApplicationMetadataComponent } from './application-setting/application-metadata/application-metadata.component';
import { ApplicationAssetHierarchyComponent } from './application-setting/application-asset-hierarchy/application-asset-hierarchy.component';
import { ApplicationRolesComponent } from './application-setting/application-roles/application-roles.component';
import { ApplicationUsersComponent } from './application-setting/application-users/application-users.component';
import { ApplicationMenuSettingsComponent } from './application-setting/application-menu-settings/application-menu-settings.component';
import { ApplicationSelectionComponent } from './application-selection/application-selection.component';
import { AssetsModule } from '../assets/assets.module';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { ApplicationDatabaseConfigurationComponent } from './application-setting/application-database-configuration/application-database-configuration.component';
import { MapViewHomeComponent } from './map-view-home/map-view-home.component';
import { ApplicationOrgTreeComponent } from './application-setting/application-org-tree/application-org-tree.component';
import { ApplicationDashboardConfigurationComponent } from './application-setting/application-dashboard-configuration/application-dashboard-configuration.component';
import { ApplicationEmailAliasComponent } from './application-setting/application-email-alias/application-email-alias.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { GoogleMapsModule } from '@angular/google-maps';
import { ApplicationFilterSettingsComponent } from './application-setting/application-filter-settings/application-filter-settings.component';
import { MatNativeDateModule } from '@angular/material/core';
import { ApplicationGatewayMonitoringComponent } from './application-gateway-monitoring/application-gateway-monitoring.component';
import { MatSortModule } from '@angular/material/sort';
import { ApplicationHistoricalLiveDataComponent } from './application-historical-live-data/application-historical-live-data.component';
@NgModule({
  declarations: [
    ApplicationDashboardComponent,
    ApplicationListComponent,
    ApplicationSettingComponent,
    ApplicationMetadataComponent,
    ApplicationAssetHierarchyComponent,
    ApplicationRolesComponent,
    ApplicationUsersComponent,
    ApplicationMenuSettingsComponent,
    ApplicationSelectionComponent,
    ApplicationDatabaseConfigurationComponent,
    MapViewHomeComponent,
    ApplicationOrgTreeComponent,
    ApplicationDashboardConfigurationComponent,
    ApplicationEmailAliasComponent,
    ApplicationFilterSettingsComponent,
    ApplicationGatewayMonitoringComponent,
    ApplicationHistoricalLiveDataComponent,
  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AssetsModule,
    AccordionModule,
    CommonCustomModule,
    AgmCoreModule,
    AgmCoreModule.forRoot({
      libraries: ['places'],
    }),
    AgmMarkerClustererModule,
    NgSelectModule,
    TooltipModule,
    NgxIntlTelInputModule,
    GoogleMapsModule,
    MatNativeDateModule,
    MatSortModule
  ],
})
export class ApplicationModule {}
