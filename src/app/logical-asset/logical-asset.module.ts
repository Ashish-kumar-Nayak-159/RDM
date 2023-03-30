import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogicalAssetRoutingModule } from './logical-asset-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Daterangepicker } from 'ng2-daterangepicker';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { CommonCustomModule } from '../common/common.module';
import { LogicalAssetComponent } from './logical-asset.component';
import { AddLogicalAssetComponent } from './add-logical-asset/add-logical-asset.component';

@NgModule({
  declarations: [LogicalAssetComponent, AddLogicalAssetComponent],
  imports: [
    CommonModule,
    LogicalAssetRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule.forRoot(),
    CommonCustomModule,
    TooltipModule,
    Daterangepicker,
    NgSelectModule,
    UiSwitchModule
  ],
})
export class LogicalAssetModule { }
