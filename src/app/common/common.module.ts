import { AccordionModule } from 'ngx-bootstrap/accordion';
import { Ng2GoogleChartsModule } from 'ng2-google-charts';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { CommonTableComponent } from './common-table/common-table.component';
import { GoogleMapsModule } from '@angular/google-maps';

import { ChartsModule } from 'ng2-charts';
import { LiveChartComponent } from './charts/live-data/live-data.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { DataTableComponent } from './charts/data-table/data-table.component';
import { ColumnChartComponent } from './charts/column-chart/column-chart.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { GaugeChartComponent } from './charts/gauge-chart/gauge-chart.component';

@NgModule({
  declarations: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent,
    LiveChartComponent,
    BarChartComponent,
    PieChartComponent,
    DataTableComponent,
    ColumnChartComponent,
    ConfirmModalComponent,
    GaugeChartComponent,

  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    ChartsModule,
    Ng2GoogleChartsModule,
    GoogleMapsModule,
    AccordionModule.forRoot()
  ],
  exports: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent,
    LiveChartComponent,
    BarChartComponent,
    PieChartComponent,
    DataTableComponent,
    ConfirmModalComponent,
    GaugeChartComponent
  ],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
export class CommonCustomModule { }
