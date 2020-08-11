import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-rdmdevice-control-panel-error',
  templateUrl: './rdmdevice-control-panel-error.component.html',
  styleUrls: ['./rdmdevice-control-panel-error.component.css']
})
export class RDMDeviceControlPanelErrorComponent implements OnInit {

  errorFilter: any = {};
  errors: any[] = [];
  @Input() device: Device = new Device();
  isErrorLoading = false;
  apiSubscriptions: Subscription[] = [];
  selectedError: any;
  isFilterSelected = false;
  constructor() { }

  ngOnInit(): void {
    this.errorFilter.device_id = this.device.device_id;
    this.errorFilter.epoch = true;
  }

  searchError(filterObj) {

  }

}
