import { ToasterService } from './../../../services/toaster.service';
import { Subscription } from 'rxjs';
import { CONSTANTS } from 'src/app/app.constants';
import { AssetService } from 'src/app/services/assets/asset.service';
import { CommonService } from 'src/app/services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { APIMESSAGES } from 'src/app/api-messages.constants';

declare var $: any;
@Component({
  selector: 'app-slaves-info',
  templateUrl: './slaves-info.component.html',
  styleUrls: ['./slaves-info.component.css'],
})
export class SlavesInfoComponent implements OnInit {
  @Input() asset: any;
  slaveData: any[] = [];
  modelSlaveData: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  isGetSlaveAPILoading = false;
  slaveObj: any;
  isAddSlaveAPILoading = false;
  userData: any;
  deleteSlaveObj: any;
  isDeleteSlaveAPILoading = false;
  isAPILoading = false;
  setupForm: FormGroup;
  constantData = CONSTANTS;
  decodedToken: any;
  assetTwin: any;
  applications = CONSTANTS.ASSETAPPPS;
  slaveProvisionedStatus: any = {};
  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) {}

  ngOnInit(): void {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetTwinData();
    this.getModelSlaveData();
    this.getSlaveData();
  }

  getAssetTwinData() {
    return new Promise<void>((resolve) => {
      this.subscriptions.push(
        this.assetService
          .getAssetTwin(
            this.contextApp.app,
            this.asset?.type === CONSTANTS.NON_IP_ASSET ? this.asset.gateway_id : this.asset.asset_id
          )
          .subscribe((response) => {
            this.assetTwin = response;
            if (this.asset.metadata?.package_app) {
              this.asset.appObj = this.applications.find((appObj) => appObj.name === this.asset.metadata.package_app);
              console.log(this.asset.appObj);
              console.log(this.assetTwin);
              if (
                this.assetTwin &&
                this.assetTwin.twin_properties.reported &&
                this.assetTwin.twin_properties.reported[this.asset.appObj.type] &&
                this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
              ) {
                if (
                  this.assetTwin.twin_properties.reported[this.asset.appObj.type][
                    this.asset.appObj.name
                  ].status?.toLowerCase() !== 'running'
                ) {
                  this.slaveProvisionedStatus = {};
                } else {
                  if (
                    this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                      .asset_configuration &&
                    this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                      .asset_configuration[this.asset.asset_id] &&
                    this.assetTwin.twin_properties.reported[this.asset.appObj.type][this.asset.appObj.name]
                      .asset_configuration[this.asset.asset_id].slaves
                  ) {
                    this.slaveProvisionedStatus =
                      this.assetTwin.twin_properties.reported[this.asset.appObj.type][
                        this.asset.appObj.name
                      ].asset_configuration[this.asset.asset_id].slaves;
                  } else {
                    this.slaveProvisionedStatus = {};
                  }
                }
              }
            }
            console.log(this.slaveProvisionedStatus);
            resolve();
          })
      );
    });
  }

  getModelSlaveData() {
    this.modelSlaveData = [];
    const obj = {};
    this.subscriptions.push(
      this.assetModelService
        .getModelSlaveDetails(this.contextApp.app, this.asset?.tags?.asset_model, obj)
        .subscribe((response: any) => {
          if (response.data) {
            this.modelSlaveData = response.data;
          }
        })
    );
  }

  getSlaveData() {
    this.slaveData = [];
    this.isGetSlaveAPILoading = true;
    const obj = {};
    this.subscriptions.push(
      this.assetService.getAssetSlaveDetails(this.contextApp.app, this.asset.asset_id, obj).subscribe(
        (response: any) => {
          if (response.data) {
            this.slaveData = response.data;
          }
          this.isGetSlaveAPILoading = false;
        },
        (error) => (this.isGetSlaveAPILoading = false)
      )
    );
  }

  addSlaveToAssetModal() {
    this.slaveObj = {
      metadata: {},
    };
    this.openModal('addSlaveModal');
    this.setupFormData();
  }

  setupFormData(obj = undefined) {
    console.log(obj);
    if (this.asset.tags.protocol === 'ModbusTCPMaster') {
      this.setupForm = new FormGroup({
        host_address: new FormControl(
          obj &&
          obj.metadata &&
          obj.metadata &&
          obj.metadata.host_address !== undefined &&
          obj.metadata.host_address !== null
            ? obj.metadata.host_address
            : null,
          [Validators.required]
        ),
        port_number: new FormControl(
          obj &&
          obj.metadata &&
          obj.metadata &&
          obj.metadata.port_number !== undefined &&
          obj.metadata.port_number !== null
            ? obj.metadata.port_number
            : null,
          [Validators.required, Validators.min(0)]
        ),
        slave_id: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.slave_id !== undefined && obj.metadata.slave_id !== null
            ? obj.metadata.slave_id
            : null,
          [Validators.required]
        ),
      });
    } else if (this.asset.tags.protocol === 'ModbusRTUMaster') {
      this.setupForm = new FormGroup({
        com_port: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.com_port !== undefined && obj.metadata.com_port !== null
            ? obj.metadata.com_port
            : null,
          [Validators.required]
        ),
        baud_rate: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.baud_rate !== undefined && obj.metadata.baud_rate !== null
            ? obj.metadata.baud_rate
            : null,
          [Validators.required]
        ),
        data_bits: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.data_bits !== undefined && obj.metadata.data_bits !== null
            ? obj.metadata.data_bits
            : null,
          [Validators.required, Validators.min(5), Validators.max(9)]
        ),
        slave_id: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.slave_id !== undefined && obj.metadata.slave_id !== null
            ? obj.metadata.slave_id
            : null,
          [Validators.required]
        ),
        parity: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.parity !== undefined && obj.metadata.parity !== null
            ? obj.metadata.parity
            : null,
          [Validators.required, Validators.min(0), Validators.max(2)]
        ),
        stop_bits: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.stop_bits !== undefined && obj.metadata.stop_bits !== null
            ? obj.metadata.stop_bits
            : null,
          [Validators.required]
        ),
      });
    } else if (this.asset.tags.protocol === 'SiemensTCPIP') {
      this.setupForm = new FormGroup({
        host_address: new FormControl(
          obj &&
          obj.metadata &&
          obj.metadata &&
          obj.metadata.host_address !== undefined &&
          obj.metadata.host_address !== null
            ? obj.metadata.host_address
            : null,
          [Validators.required]
        ),
        rack: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.rack !== undefined && obj.metadata.rack !== null
            ? obj.metadata.rack
            : null,
          [Validators.required, Validators.min(0), Validators.max(7)]
        ),
        slot: new FormControl(
          obj && obj.metadata && obj.metadata && obj.metadata.slot !== undefined && obj.metadata.slot !== null
            ? obj.metadata.slot
            : null,
          [Validators.required, Validators.min(0), Validators.max(31)]
        ),
      });
    }
  }

  onClickOfSlaveAccordion(slave) {
    this.setupFormData(slave);
  }

  removeSlaveFromAsset(slave) {
    this.openModal('confirmMessageModal');
    this.deleteSlaveObj = JSON.parse(JSON.stringify(slave));
  }

  addSlaveObj() {
    if (!this.slaveObj.slave_id || !this.slaveObj?.metadata?.mac_id) {
      this.toasterService.showError(APIMESSAGES.ALL_FIELDS_REQUIRED, 'Add Slave');
      return;
    }
    if (!CONSTANTS.MAC_ADDRESS_REGEX.test(this.slaveObj?.metadata?.mac_id)) {
      this.toasterService.showError('MAC address is not valid', 'Add Sensor Detail');
      return;
    }
    this.isAddSlaveAPILoading = true;
    this.slaveObj.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.slaveObj.asset_model = this.asset?.tags?.asset_model || this.asset?.asset_model;
    const macID = this.slaveObj.metadata.mac_id;
    this.slaveObj.metadata = this.setupForm?.value || {};
    this.slaveObj.metadata.mac_id = macID;
    this.subscriptions.push(
      this.assetService.createAssetSlaveDetail(this.contextApp.app, this.asset.asset_id, this.slaveObj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Add Slave');
          this.isAddSlaveAPILoading = false;
          this.onCloseModal('addSlaveModal');
          this.getSlaveData();
          this.slaveObj = undefined;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Add Slave');
          this.isAddSlaveAPILoading = false;
        }
      )
    );
  }

  updateSlaveObj(slave) {
    const obj: any = {
      metadata: slave?.metadata,
    };
    if (!obj.metadata?.mac_id) {
      this.toasterService.showError(APIMESSAGES.ALL_FIELDS_REQUIRED, 'Update Sensor Detail');
      return;
    }

    const macID = obj.metadata.mac_id;
    console.log(CONSTANTS.MAC_ADDRESS_REGEX.test(macID));
    if (!CONSTANTS.MAC_ADDRESS_REGEX.test(macID)) {
      this.toasterService.showError('MAC address is not valid', 'Update Sensor Detail');
      return;
    }
    this.isAddSlaveAPILoading = true;
    obj.metadata = this.setupForm?.value || {};
    obj.metadata.mac_id = macID;
    obj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetService.updateAssetSlaveDetail(this.contextApp.app, this.asset.asset_id, slave.id, obj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Update Sensor Detail');
          this.isAddSlaveAPILoading = false;
          this.getSlaveData();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Update Sensor Detail');
          this.isAddSlaveAPILoading = false;
        }
      )
    );
  }

  deleteSlave() {
    this.isDeleteSlaveAPILoading = true;
    this.subscriptions.push(
      this.assetService
        .deleteAssetSlaveDetail(this.contextApp.app, this.asset.asset_id, this.deleteSlaveObj.id)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Delete Slave');
            this.isDeleteSlaveAPILoading = false;
            this.onCloseModal('confirmMessageModal');
            this.getSlaveData();
            this.deleteSlaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Delete Slave');
            this.isDeleteSlaveAPILoading = false;
          }
        )
    );
  }

  syncSlavesWithGateway() {
    this.isAPILoading = true;
    const c2dObj = {
      asset_id: this.asset.asset_id,
      job_id:
        (this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id) +
        '_' +
        this.commonService.generateUUID(),
      request_type: 'Sync Slaves',
      job_type: 'Message',
      sub_job_id: null,
      message: null,
    };
    const obj = {
      command: 'register_slaves',
      slaves: {},
    };
    this.slaveData.forEach((slave) => {
      obj.slaves[slave.slave_id] = {
        mac_id: slave.metadata?.mac_id,
        category: slave.slave_category?.slave_category,
      };
    });
    c2dObj.message = obj;
    c2dObj.sub_job_id = c2dObj.job_id + '_1';
    this.subscriptions.push(
      this.assetService
        .sendC2DMessage(
          c2dObj,
          this.contextApp.app,
          this.asset.type !== CONSTANTS.NON_IP_ASSET ? this.asset.asset_id : this.asset.gateway_id
        )
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Sync Slaves');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Sync Slaves');
            this.assetService.refreshRecentJobs.emit();
            this.isAPILoading = false;
          }
        )
    );
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseModal(id) {
    $('#' + id).modal('hide');
  }
}
