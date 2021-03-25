import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {
  componentState: string;
  constantData = CONSTANTS;
  subscriptions: Subscription[] = [];
  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.route.paramMap.subscribe(params => {
      if (params.get('listName')) {
        const listName = params.get('listName');
        if (listName.toLowerCase() === 'nonipdevices') {
          this.componentState = CONSTANTS.NON_IP_DEVICE;
        } else if (listName.toLowerCase() === 'gateways') {
          this.componentState = CONSTANTS.IP_GATEWAY;
        } else if (listName.toLowerCase() === 'devices') {
          this.componentState = CONSTANTS.IP_DEVICE;
        }
      }
    }));
  }

}
