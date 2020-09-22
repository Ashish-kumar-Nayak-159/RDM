import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule } from 'ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ApplicationRoutingModule } from './application-routing.module';
import { ApplicationDashboardComponent } from './application-dashboard/application-dashboard.component';
import { ApplicationListComponent } from './application-list/application-list.component';
import { ApplicationNotificationComponent } from './application-notification/application-notification.component';
import { ApplicationSettingComponent } from './application-setting/application-setting.component';
import { ApplicationMetadataComponent } from './application-setting/application-metadata/application-metadata.component';
import { ApplicationDeviceHierarchyComponent } from './application-setting/application-device-hierarchy/application-device-hierarchy.component';
import { ApplicationRolesComponent } from './application-setting/application-roles/application-roles.component';
import { ApplicationUsersComponent } from './application-setting/application-users/application-users.component';
import { ApplicationMenuSettingsComponent } from './application-setting/application-menu-settings/application-menu-settings.component';
import { ApplicationPropertiesComponent } from './application-setting/application-properties/application-properties.component';


@NgModule({
  declarations: [
    ApplicationDashboardComponent,
    ApplicationListComponent,
    ApplicationNotificationComponent,
    ApplicationSettingComponent,
    ApplicationMetadataComponent,
    ApplicationDeviceHierarchyComponent,
    ApplicationRolesComponent,
    ApplicationUsersComponent,
    ApplicationMenuSettingsComponent,
    ApplicationPropertiesComponent
  ],
  imports: [
  CommonModule,
    ApplicationRoutingModule,
    ChartsModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ApplicationModule { }
