import { CONSTANTS } from './../../../app.constants';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/app.constants';
import { environment } from './../../../../environments/environment';
import { Component, Input, OnInit } from '@angular/core';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';

@Component({
  selector: 'app-device-type-overview',
  templateUrl: './device-type-overview.component.html',
  styleUrls: ['./device-type-overview.component.css']
})
export class DeviceTypeOverviewComponent implements OnInit {

  @Input() deviceType: any;
  blobSASToken = environment.blobKey;
  appAdminRole = CONSTANTS.APP_ADMIN_ROLE;
  constructor(
    private toasterService: ToasterService,
    private deviceTypeService: DeviceTypeService
  ) { }

  ngOnInit(): void {
    if (!this.deviceType.metadata?.image) {
      this.deviceType.metadata.image = {
        url: CONSTANTS.DEFAULT_MODEL_IMAGE
      };
    }
  }

  freezeUnfreezeModel(type) {
    this.deviceType.freeze = (type === 'freeze' ? true : false);
  }

  syncWithCache() {
    this.deviceTypeService.syncModelCache(this.deviceType.app, this.deviceType.id)
    .subscribe((response: any) => {
      this.toasterService.showSuccess(response.message, 'Sync Model Data');
    }, error => {
      this.toasterService.showError(error.message, 'Sync Model Data');
    });
  }

}
