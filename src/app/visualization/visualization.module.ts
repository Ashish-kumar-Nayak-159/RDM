import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisualizationRoutingModule } from './visualization-routing.module';
import { ApplicationVisualizationComponent } from './application-visualization/application-visualization.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';


@NgModule({
  declarations: [ApplicationVisualizationComponent],
  imports: [
    CommonModule,
    VisualizationRoutingModule,
    Ng2GoogleChartsModule
  ]
})
export class VisualizationModule { }
