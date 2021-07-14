import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { FileSaverModule } from 'ngx-filesaver';
import { MonacoEditorModule } from 'ngx-monaco-editor';

import { DeviceTypeListComponent } from './device-type-list/device-type-list.component';
import { CommonCustomModule } from '../common/common.module';
import { DeviceTypeRoutingModule } from './device-type-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DeviceTypeControlPanelComponent } from './device-type-control-panel/device-type-control-panel.component';
import { DeviceTypeOverviewComponent } from './device-type-control-panel/device-type-overview/device-type-overview.component';
import { DeviceTypeTagsComponent } from './device-type-control-panel/device-type-tags/device-type-tags.component';
import { DeviceTypePropertiesComponent } from './device-type-control-panel/device-type-properties/device-type-properties.component';
import { DeviceTypeJsonPacketFormatComponent } from './device-type-control-panel/device-type-json-packet-format/device-type-json-packet-format.component';
import { DeviceTypeControlWidgetsComponent } from './device-type-control-panel/device-type-control-widgets/device-type-control-widgets.component';
import { DeviceTypeDeviceMethodsComponent } from './device-type-control-panel/device-type-device-methods/device-type-device-methods.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DeviceTypeLayoutComponent } from './device-type-control-panel/device-type-layout/device-type-layout.component';
import { DeviceTypeHistoryLayoutComponent } from './device-type-control-panel/device-type-layout/device-type-history-layout/device-type-history-layout.component';
import { DeviceTypeLiveLayoutComponent } from './device-type-control-panel/device-type-layout/device-type-live-layout/device-type-live-layout.component';
import { DeviceTypeAlertConditionsComponent } from './device-type-control-panel/device-type-alert-conditions/device-type-alert-conditions.component';
import { DeviceTypeReferenceDocumentsComponent } from './device-type-control-panel/device-type-reference-documents/device-type-reference-documents.component';
import { DeviceTypeConfigurationWidgetsComponent } from './device-type-control-panel/device-type-configuration-widgets/device-type-configuration-widgets.component';
import { DeviceTypeSettingsComponent } from './device-type-control-panel/device-type-settings/device-type-settings.component';
import { DeviceTypePackageManagementComponent } from './device-type-control-panel/device-type-package-management/device-type-package-management.component';
import { DeviceTypeRulesComponent } from './device-type-control-panel/device-type-rules/device-type-rules.component';
import { DeviceTypeDerivedKpisComponent } from './device-type-control-panel/device-type-derived-kpis/device-type-derived-kpis.component';
import { DeviceTypeStreamProcessingComponent } from './device-type-control-panel/device-type-stream-processing/device-type-stream-processing.component';
import { DeviceTypeAlertAcknowledgementReasonsComponent } from './device-type-control-panel/device-type-alert-acknowledgement-reasons/device-type-alert-acknowledgement-reasons.component';
import { DeviceTypeSlaveInfoComponent } from './device-type-control-panel/device-type-slave-info/device-type-slave-info.component';



@NgModule({
  declarations: [
    DeviceTypeListComponent,
    DeviceTypeControlPanelComponent,
    DeviceTypeOverviewComponent,
    DeviceTypeTagsComponent,
    DeviceTypePropertiesComponent,
    DeviceTypeJsonPacketFormatComponent,
    DeviceTypeControlWidgetsComponent,
    DeviceTypeDeviceMethodsComponent,
    DeviceTypeLayoutComponent,
    DeviceTypeHistoryLayoutComponent,
    DeviceTypeLiveLayoutComponent,
    DeviceTypeAlertConditionsComponent,
    DeviceTypeReferenceDocumentsComponent,
    DeviceTypeConfigurationWidgetsComponent,
    DeviceTypeSettingsComponent,
    DeviceTypePackageManagementComponent,
    DeviceTypeRulesComponent,
    DeviceTypeDerivedKpisComponent,
    DeviceTypeStreamProcessingComponent,
    DeviceTypeAlertAcknowledgementReasonsComponent,
    DeviceTypeSlaveInfoComponent,
  ],
  imports: [
    CommonModule,
    DeviceTypeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule,
    AccordionModule.forRoot(),
    NgJsonEditorModule,
    AngularMultiSelectModule,
    FileSaverModule,
    MonacoEditorModule, // use forRoot() in main app
    NgSelectModule,
    TooltipModule
  ]
})
export class DeviceTypeModule { }
