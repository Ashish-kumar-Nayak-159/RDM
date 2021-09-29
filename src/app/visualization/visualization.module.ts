import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisualizationRoutingModule } from './visualization-routing.module';
import { ApplicationVisualizationComponent } from './application-visualization/application-visualization.component';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from '../common/common.module';

@NgModule({
  declarations: [ApplicationVisualizationComponent],
  imports: [
    CommonModule,
    VisualizationRoutingModule,
    FormsModule,
    AccordionModule.forRoot(),
    CommonCustomModule,
    UiSwitchModule,
    NgSelectModule,
    Daterangepicker,
    TooltipModule,
  ],
  exports: [ApplicationVisualizationComponent],
})
export class VisualizationModule {}
