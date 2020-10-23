import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from '../devices/device-control-panel/filter/filter.component';
import { TableComponent } from '../devices/device-control-panel/table/table.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { CommonTableComponent } from './common-table/common-table.component';
import { LineChartComponent } from './line-chart/line-chart.component';
import { ChartWidgetComponent } from './chart-widget/chart-widget.component';
import { MapWidgetComponent } from './map-widget/map-widget.component';
import { GoogleMapsModule } from '@angular/google-maps';

import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent,
    LineChartComponent,
    ChartWidgetComponent,
    MapWidgetComponent,

  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    ChartsModule,
    Ng2GoogleChartsModule,
    GoogleMapsModule
  ],
  exports: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent,
    ChartWidgetComponent,
    MapWidgetComponent,
  ],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
export class CommonCustomModule { }
