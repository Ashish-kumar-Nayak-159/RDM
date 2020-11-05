import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisualizationRoutingModule } from './visualization-routing.module';
import { ApplicationVisualizationComponent } from './application-visualization/application-visualization.component';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { AccordionModule } from 'ngx-bootstrap/accordion';


@NgModule({
  declarations: [ApplicationVisualizationComponent],
  imports: [
    CommonModule,
    VisualizationRoutingModule,
    FormsModule,
    Ng2GoogleChartsModule,
    AngularMultiSelectModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    AccordionModule.forRoot(),
  ],
  providers: [
    {provide: OWL_DATE_TIME_LOCALE, useValue: {useUtc: true}}
  ]
})
export class VisualizationModule { }
