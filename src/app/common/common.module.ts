import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { CommonTableComponent } from './common-table/common-table.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { ColorPickerModule } from 'ngx-color-picker';
import { LiveChartComponent } from './charts/live-data/live-data.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { DataTableComponent } from './charts/data-table/data-table.component';
import { ColumnChartComponent } from './charts/column-chart/column-chart.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';
import { GaugeChartComponent } from './charts/gauge-chart/gauge-chart.component';
import { LineChartWithoutAxisComponent } from './charts/line-chart-without-axis/line-chart-without-axis.component';
import { OnlyNumberWidgetComponent } from './live-widgets/only-number-widget/only-number-widget.component';
import { AddOnlyNumberWidgetComponent } from './live-widgets/only-number-widget/add-only-number-widget/add-only-number-widget.component';
import { LiveLineChartComponent } from './charts/live-widgets/live-line-chart/live-line-chart.component';
import { CommonDataTableComponent } from './table/common-data-table/common-data-table.component';
import { CommonTableFilterComponent } from './table/common-table-filter/common-table-filter.component';
import { DamagePlotChartComponent } from './charts/damage-plot-chart/damage-plot-chart.component';
import { DataTypeFieldsComponent } from './data-type-fieds/data-type-fieds.component';
import { ModelProtocolSpecificDetailsComponent } from './model-protocol-specific-details/model-protocol-specific-details.component';
import { DateRangePickerComponent } from './date-range-picker/date-range-picker.component';
import { MessageModalComponent } from './message-modal/message-modal.component';
import { HierarchyDropdownComponent } from './hierarchy-dropdown/hierarchy-dropdown.component';
import { RectangleWidgetComponent } from './charts/rectangle-widget/rectangle-widget.component';
import { CylinderWidgetComponent } from './charts/cylinder-widget/cylinder-widget.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { CommonWidgetComponent } from './charts/common-widget/common-widget.component';
import { ColumnchartLivedataComponentComponent } from './charts/columnchart-livedata-component/columnchart-livedata-component.component';
import { FormValidatorDirective } from '../validator/form-validator.directive';
import { SmallNumberWidgetComponent } from './live-widgets/only-number-widget/small-number-widget.component';
import { ConditionalWidgetComponent } from './live-widgets/only-number-widget/conditional-widget/conditional-widget.component';
import { BsDatepickerModule, BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { HistoricalLivechartComponent } from './charts/historical-livechart/historical-livechart.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { LinechartComponent } from './newcharts/linechart/linechart.component';

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
    LineChartWithoutAxisComponent,
    OnlyNumberWidgetComponent,
    AddOnlyNumberWidgetComponent,
    LiveLineChartComponent,
    CommonDataTableComponent,
    CommonTableFilterComponent,
    DamagePlotChartComponent,
    DataTypeFieldsComponent,
    ModelProtocolSpecificDetailsComponent,
    DateRangePickerComponent,
    MessageModalComponent,
    HierarchyDropdownComponent,
    RectangleWidgetComponent,
    CylinderWidgetComponent,
    CommonWidgetComponent,
    ColumnchartLivedataComponentComponent,
    FormValidatorDirective,
    SmallNumberWidgetComponent,
    ConditionalWidgetComponent,
    HistoricalLivechartComponent,
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTableModule,
    GoogleMapsModule,
    AccordionModule.forRoot(),
    FormsModule,
    ColorPickerModule,
    TooltipModule,
    NgSelectModule,
    ReactiveFormsModule,
    Daterangepicker,
    NgJsonEditorModule,
    BsDatepickerModule.forRoot(),
    MatIconModule,
    MatMenuModule,


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
    GaugeChartComponent,
    LineChartWithoutAxisComponent,
    OnlyNumberWidgetComponent,
    AddOnlyNumberWidgetComponent,
    SmallNumberWidgetComponent,
    ConditionalWidgetComponent,
    LiveLineChartComponent,
    CommonDataTableComponent,
    DamagePlotChartComponent,
    DataTypeFieldsComponent,
    ModelProtocolSpecificDetailsComponent,
    DateRangePickerComponent,
    MessageModalComponent,
    HierarchyDropdownComponent,
    RectangleWidgetComponent,
    CylinderWidgetComponent,
    FormValidatorDirective,
    BsDatepickerModule,
    HistoricalLivechartComponent,


  ],
  providers: [{ provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } }, BsDatepickerConfig],
})
export class CommonCustomModule { }
