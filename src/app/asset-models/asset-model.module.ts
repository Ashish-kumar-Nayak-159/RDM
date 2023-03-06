import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { FileSaverModule } from 'ngx-filesaver';

import { AssetModelListComponent } from './asset-model-list/asset-model-list.component';
import { CommonCustomModule } from '../common/common.module';
import { AssetModelRoutingModule } from './asset-model-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AssetModelControlPanelComponent } from './asset-model-control-panel/asset-model-control-panel.component';
import { AssetModelOverviewComponent } from './asset-model-control-panel/asset-model-overview/asset-model-overview.component';
import { AssetModelTagsComponent } from './asset-model-control-panel/asset-model-tags/asset-model-tags.component';
import { AssetModelPropertiesComponent } from './asset-model-control-panel/asset-model-properties/asset-model-properties.component';
import { AssetModelJsonPacketFormatComponent } from './asset-model-control-panel/asset-model-json-packet-format/asset-model-json-packet-format.component';
import { AssetModelControlWidgetsComponent } from './asset-model-control-panel/asset-model-control-widgets/asset-model-control-widgets.component';
import { AssetModelDeviceMethodsComponent } from './asset-model-control-panel/asset-model-device-methods/asset-model-device-methods.component';
import { AssetModelLayoutComponent } from './asset-model-control-panel/asset-model-layout/asset-model-layout.component';
import { AssetModelHistoryLayoutComponent } from './asset-model-control-panel/asset-model-layout/asset-model-history-layout/asset-model-history-layout.component';
import { AssetModelLiveLayoutComponent } from './asset-model-control-panel/asset-model-layout/asset-model-live-layout/asset-model-live-layout.component';
import { AssetModelAlertConditionsComponent } from './asset-model-control-panel/asset-model-alert-conditions/asset-model-alert-conditions.component';
import { AssetModelReferenceDocumentsComponent } from './asset-model-control-panel/asset-model-reference-documents/asset-model-reference-documents.component';
import { AssetModelConfigurationWidgetsComponent } from './asset-model-control-panel/asset-model-configuration-widgets/asset-model-configuration-widgets.component';
import { AssetModelSettingsComponent } from './asset-model-control-panel/asset-model-settings/asset-model-settings.component';
import { AssetModelPackageManagementComponent } from './asset-model-control-panel/asset-model-package-management/asset-model-package-management.component';
import { AssetModelRulesComponent } from './asset-model-control-panel/asset-model-rules/asset-model-rules.component';
import { AssetModelDerivedKpisComponent } from './asset-model-control-panel/asset-model-derived-kpis/asset-model-derived-kpis.component';
import { AssetModelAlertAcknowledgementReasonsComponent } from './asset-model-control-panel/asset-model-alert-acknowledgement-reasons/asset-model-alert-acknowledgement-reasons.component';
import { AssetModelSlaveInfoComponent } from './asset-model-control-panel/asset-model-slave-info/asset-model-slave-info.component';
import { AddRuleComponent } from './asset-model-control-panel/add-rule/add-rule.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AssetModelControlPropertiesComponent } from './asset-model-control-panel/asset-model-control-properties/asset-model-control-properties.component';
import { AddwidgetComponent } from './asset-model-control-panel/widget/addwidget/addwidget.component';
import { HistoricalwidgetComponent } from './asset-model-control-panel/widget/historicalwidget/historicalwidget.component';
import { LivewidgetComponent } from './asset-model-control-panel/widget/livewidget/livewidget.component';
import { WidgetComponent } from './asset-model-control-panel/widget/widget.component';
import { LinechartComponent } from '../common/newcharts/linechart/linechart.component';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
@NgModule({
  declarations: [
    AssetModelListComponent,
    AssetModelControlPanelComponent,
    AssetModelOverviewComponent,
    AssetModelTagsComponent,
    AssetModelPropertiesComponent,
    AssetModelJsonPacketFormatComponent,
    AssetModelControlWidgetsComponent,
    AssetModelDeviceMethodsComponent,
    AssetModelLayoutComponent,
    AssetModelHistoryLayoutComponent,
    AssetModelLiveLayoutComponent,
    AssetModelAlertConditionsComponent,
    AssetModelReferenceDocumentsComponent,
    AssetModelConfigurationWidgetsComponent,
    AssetModelSettingsComponent,
    AssetModelPackageManagementComponent,
    AssetModelRulesComponent,
    AssetModelDerivedKpisComponent,
    AssetModelAlertAcknowledgementReasonsComponent,
    AssetModelSlaveInfoComponent,
    AddRuleComponent,
    AssetModelControlPropertiesComponent,
    AddwidgetComponent,
    HistoricalwidgetComponent,
    LivewidgetComponent,
    WidgetComponent,
    LinechartComponent,


  ],
  imports: [
    CommonModule,
    AssetModelRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule,
    AccordionModule.forRoot(),
    NgJsonEditorModule,
    FileSaverModule,
    NgSelectModule,
    TooltipModule,
    UiSwitchModule,
    MatIconModule,
    MatMenuModule,
  ],
  exports: [AddRuleComponent],
})
export class AssetModelModule { }
