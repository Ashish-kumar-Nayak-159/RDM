import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Device } from 'src/app/models/device.model';
import { Subscription } from 'rxjs';
import { DeviceService } from 'src/app/services/devices/device.service';
import * as moment from 'moment';
import { CommonService } from 'src/app/services/common.service';
declare var $: any;


@Component({
  selector: 'app-commands',
  templateUrl: './commands.component.html',
  styleUrls: ['./commands.component.css']
})
export class CommandsComponent implements OnInit {

  @Input() pageType;
  @Input() device: Device = new Device();
  @Input() callingPage = 'Device';
  displayMode: string;
  timerObj: any;
  selectedCommunicationTechnique: string;
  constructor(
    private deviceService: DeviceService
  ) { }

  ngOnInit(): void {

    this.deviceService.composeC2DMessageStartEmitter.subscribe(data => {
      this.timerObj = {
        hours: data.hours,
        minutes: data.minutes,
        seconds: data.seconds
      };
    });
    if (this.callingPage === 'gateway') {
      this.displayMode = 'view';
      this.timerObj = undefined;
    }
  }

  onClickOfGeneralCommands() {
    this.displayMode = '';
    setTimeout(() => {
      this.displayMode = 'general_commands';
    }, 500);
    this.timerObj = undefined;
  }

  onClickOfSpecificCommands(type) {
    this.displayMode = '';
    setTimeout(() => {

      this.displayMode = type + '_specific_commands';
    }, 500);
    this.timerObj = undefined;
  }


}
