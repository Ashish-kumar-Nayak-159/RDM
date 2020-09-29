import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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



@NgModule({
  declarations: [DeviceTypeListComponent, DeviceTypeControlPanelComponent, DeviceTypeOverviewComponent, DeviceTypeTagsComponent, DeviceTypePropertiesComponent, DeviceTypeJsonPacketFormatComponent, DeviceTypeControlWidgetsComponent],
  imports: [
    CommonModule,
    DeviceTypeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule
  ]
})
export class DeviceTypeModule { }
