import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from '../devices/device-control-panel/filter/filter.component';
import { TableComponent } from '../devices/device-control-panel/table/table.component';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { CommonTableComponent } from './common-table/common-table.component';



@NgModule({
  declarations: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
  ],
  exports: [
    // FilterComponent,
    // TableComponent,
    CommonTableComponent
  ],
  providers: [
    {provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true}}
  ]
})
export class CommonCustomModule { }
