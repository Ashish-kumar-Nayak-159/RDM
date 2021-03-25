import { AgmCoreModule } from '@agm/core';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from './../common/common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { ApplicationMetadataComponent } from './application-setting/application-metadata/application-metadata.component';
import { ApplicationDeviceHierarchyComponent } from './application-setting/application-device-hierarchy/application-device-hierarchy.component';
import { ApplicationRolesComponent } from './application-setting/application-roles/application-roles.component';
import { ApplicationUsersComponent } from './application-setting/application-users/application-users.component';
import { ApplicationMenuSettingsComponent } from './application-setting/application-menu-settings/application-menu-settings.component';
import { ApplicationSelectionComponent } from './application-selection/application-selection.component';
import { DevicesModule } from '../devices/devices.module';
import { ApplicationNotificationsComponent } from './application-notifications/application-notifications.component';
import { ApplicationAlertsComponent } from './application-alerts/application-alerts.component';
import { ApplicationEventsComponent } from './application-events/application-events.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { ApplicationDatabaseConfigurationComponent } from './application-setting/application-database-configuration/application-database-configuration.component';


@NgModule({
  declarations: [
    ApplicationDashboardComponent,
    ApplicationListComponent,
    ApplicationSettingComponent,
    ApplicationMetadataComponent,
    ApplicationDeviceHierarchyComponent,
    ApplicationRolesComponent,
    ApplicationUsersComponent,
    ApplicationMenuSettingsComponent,
    ApplicationSelectionComponent,
    ApplicationNotificationsComponent,
    ApplicationAlertsComponent,
    ApplicationEventsComponent,
    ApplicationDatabaseConfigurationComponent
  ],
  imports: [
    CommonModule,
    ApplicationRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DevicesModule,
    AccordionModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CommonCustomModule,
    AgmCoreModule,
    AgmMarkerClustererModule
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: {useUtc: true}}
  ]
})
export class ApplicationModule { }
