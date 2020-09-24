import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceTypeListComponent } from './device-type-list/device-type-list.component';
import { CommonCustomModule } from '../common/common.module';
import { DeviceTypeRoutingModule } from './device-type-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [DeviceTypeListComponent],
  imports: [
    CommonModule,
    DeviceTypeRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonCustomModule
  ]
})
export class DeviceTypeModule { }
