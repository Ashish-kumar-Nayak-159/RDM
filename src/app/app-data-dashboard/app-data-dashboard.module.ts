import { FormsModule } from '@angular/forms';
import { VisualizationModule } from './../visualization/visualization.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { AssetsModule } from './../assets/assets.module';
import { CommonCustomModule } from './../common/common.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppDataDashboardComponent } from './app-data-dashboard/app-data-dashboard.component';
import { AppDataDashboardRoutingModule } from './app-data-dashboard-routing.module';
import { AgmCoreModule } from '@agm/core';
import { AgmMarkerClustererModule } from '@agm/markerclusterer';
import { AppDashboardHistoricalComponent } from '../app-dashboard/app-dashboard-historical/app-dashboard-historical.component';
import {AgmOverlays} from 'agm-overlays';
@NgModule({
  declarations: [
    AppDataDashboardComponent,
     AppDashboardHistoricalComponent,
    ],
  imports: [
    CommonModule,
    AppDataDashboardRoutingModule,
    CommonCustomModule,
    AssetsModule,
    FormsModule,
    VisualizationModule,
    UiSwitchModule,
    NgSelectModule,
    TooltipModule,
    AgmCoreModule,
    AgmOverlays,
    AgmCoreModule.forRoot({
      libraries: ['places'],
    }),
    AgmMarkerClustererModule,
    GoogleMapsModule
  ],
})
export class AppDataDashboardModule {}
