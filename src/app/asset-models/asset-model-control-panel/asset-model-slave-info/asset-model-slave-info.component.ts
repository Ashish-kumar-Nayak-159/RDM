import { filter } from 'rxjs/operators';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { CommonService } from 'src/app/services/common.service';
import { Subscription } from 'rxjs';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { APIMESSAGES } from 'src/app/constants/api-messages.constants';
import { UIMESSAGES } from 'src/app/constants/ui-messages.constants';

declare var $: any;
@Component({
  selector: 'app-asset-model-slave-info',
  templateUrl: './asset-model-slave-info.component.html',
  styleUrls: ['./asset-model-slave-info.component.css'],
})
export class AssetModelSlaveInfoComponent implements OnInit, OnDestroy {
  @Input() assetModel: any;
  userData: any;
  contextApp: any;
  subscriptions: Subscription[] = [];
  slaveObj: any;
  slaveData: any[] = [];
  slavePositions: any[] = [];
  isSlaveDataLoading = false;
  slaveTableConfig: any;
  isCreateSlaveAPILoading = false;
  isDeleteSlaveAPILoading = false;
  deleteSlaveObj: any;
  slaveCategories: any[] = [];
  mainSelectedTab: string;
  filteredSlavePositions: any[] = [];
  decodedToken: any;
  modalConfig: { stringDisplay: boolean; isDisplaySave: boolean; isDisplayCancel: boolean };
  constructor(
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService
  ) {}
  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.onTabClick('slaves');
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.getSlaveData();
    this.getSlavePositions();
    this.getSlaveCategories();
  }

  onTabClick(type) {
    this.mainSelectedTab = type;
    if (type === 'slaves') {
      this.slaveTableConfig = {
        type: 'Sources / Slaves / Sensors',
        tableHeight: 'calc(100vh - 14rem)',
        freezed: this.assetModel.freezed,
        data: [
          {
            name: 'Type',
            key: 'slave_type',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Category',
            key: 'slave_category.slave_category',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Position',
            key: 'slave_position.slave_position',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'ID',
            key: 'slave_id',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Display Name',
            key: 'slave_name',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            isColumnHidden: this.decodedToken?.privileges?.indexOf('ASMMM') === -1,
            headerClass: 'w-10',
            btnData: [
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'Edit',
                valueclass: '',
                tooltip: 'Edit',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
              {
                icon: 'fa fa-fw fa-trash',
                text: '',
                id: 'Delete',
                valueclass: '',
                tooltip: 'Delete',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
            ],
          },
        ],
      };
    } else if (type === 'slave positions') {
      this.slaveTableConfig = {
        type: 'Slave Positions',
        tableHeight: 'calc(100vh - 14rem)',
        freezed: this.assetModel.freezed,
        data: [
          {
            name: 'Slave Category',
            key: 'slave_category.slave_category',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Slave Position',
            key: 'slave_position',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            headerClass: 'w-10',
            isColumnHidden: this.decodedToken?.privileges?.indexOf('ASMMM') === -1,
            btnData: [
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'Edit',
                valueclass: '',
                tooltip: 'Edit',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
              {
                icon: 'fa fa-fw fa-trash',
                text: '',
                id: 'Delete',
                valueclass: '',
                tooltip: 'Delete',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
            ],
          },
        ],
      };
    } else if (type === 'slave categories') {
      this.slaveTableConfig = {
        type: 'Slave Category',
        tableHeight: 'calc(100vh - 14rem)',
        freezed: this.assetModel.freezed,
        data: [
          {
            name: 'Slave Category',
            key: 'slave_category',
            type: 'text',
            headerClass: '',
            valueclass: '',
          },
          {
            name: 'Actions',
            key: undefined,
            type: 'button',
            isColumnHidden: this.decodedToken?.privileges?.indexOf('ASMMM') === -1,
            headerClass: 'w-10',
            btnData: [
              {
                icon: 'fa fa-fw fa-edit',
                text: '',
                id: 'Edit',
                valueclass: '',
                tooltip: 'Edit',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
              {
                icon: 'fa fa-fw fa-trash',
                text: '',
                id: 'Delete',
                valueclass: '',
                tooltip: 'Delete',
                privilege_key: 'ASMMM',
                disableConditions: {
                  key: 'freezed',
                  value: true,
                },
              },
            ],
          },
        ],
      };
    }
  }

  getSlaveData() {
    this.slaveData = [];
    this.isSlaveDataLoading = true;
    const filterObj = {};
    this.subscriptions.push(
      this.assetModelService.getModelSlaveDetails(this.contextApp.app, this.assetModel.name, filterObj).subscribe(
        (response: any) => {
          if (response?.data) {
            this.slaveData = response.data;
            this.isSlaveDataLoading = false;
          }
        },
        (error) => (this.isSlaveDataLoading = false)
      )
    );
  }

  getSlaveCategories() {
    this.slaveCategories = [];
    const filterObj = {};
    this.subscriptions.push(
      this.assetModelService
        .getModelSlaveCategories(this.contextApp.app, this.assetModel.name, filterObj)
        .subscribe((response: any) => {
          if (response?.data) {
            this.slaveCategories = response.data;
          }
        })
    );
  }

  getSlavePositions() {
    this.slavePositions = [];
    const filterObj = {};
    this.subscriptions.push(
      this.assetModelService
        .getModelSlavePositions(this.contextApp.app, this.assetModel.name, filterObj)
        .subscribe((response: any) => {
          if (response?.data) {
            this.slavePositions = response.data;
          }
        })
    );
  }

  addSlaveInfoInModal() {
    this.slaveObj = {
      metadata: {},
    };
    this.openModal('addSlaveModal');
  }

  onCategorySelection() {
    this.filteredSlavePositions = this.slavePositions.filter(
      (position) => position.slave_category.id === this.slaveObj.slave_category
    );
  }

  updateSlaveInfoInModal(slaveObj) {
    this.slaveObj = JSON.parse(JSON.stringify(slaveObj));
    if (this.mainSelectedTab === 'slaves') {
      this.slaveObj.slave_position = this.slaveObj?.slave_position?.id;
      this.slaveObj.slave_category = this.slaveObj?.slave_category?.id;
    } else if (this.mainSelectedTab === 'slave positions') {
      this.slaveObj.slave_category = this.slaveObj?.slave_category?.id;
    }
    this.onCategorySelection();
    this.openModal('addSlaveModal');
  }

  saveSlaveObj() {
    if (!this.slaveObj.slave_id || !this.slaveObj.slave_name || !this.slaveObj.slave_type) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Slave Detail');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService.createModelSlaveDetail(this.contextApp.app, this.assetModel.name, this.slaveObj).subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Add Slave');
          this.isCreateSlaveAPILoading = false;
          this.onCloseModal('addSlaveModal');
          this.getSlaveData();
          this.slaveObj = undefined;
        },
        (error) => {
          this.toasterService.showError(error.message, 'Add Slave');
          this.isCreateSlaveAPILoading = false;
        }
      )
    );
  }

  updateSlaveObj() {
    if (!this.slaveObj.slave_id || !this.slaveObj.slave_name || !this.slaveObj.slave_type) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Update Slave Detail');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService
        .updateModelSlaveDetail(this.contextApp.app, this.assetModel.name, this.slaveObj.id, this.slaveObj)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Update Slave');
            this.isCreateSlaveAPILoading = false;
            this.onCloseModal('addSlaveModal');
            this.getSlaveData();
            this.slaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Update Slave');
            this.isCreateSlaveAPILoading = false;
          }
        )
    );
  }

  onModalEvents(eventType) {
    if (eventType === 'close') {
      this.onCloseModal('confirmMessageModal');
    } else if (eventType === 'save') {
      this.deleteSlave();
    }
  }

  deleteSlave() {
    if (this.mainSelectedTab === 'slaves') {
      this.isDeleteSlaveAPILoading = true;
      this.subscriptions.push(
        this.assetModelService
          .deleteModelSlaveDetail(this.contextApp.app, this.assetModel.name, this.deleteSlaveObj.id)
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
    } else if (this.mainSelectedTab === 'slave positions') {
      this.deleteSlavePosition();
    } else if (this.mainSelectedTab === 'slave categories') {
      this.deleteSlaveCategory();
    }
  }

  saveSlavePositionObj() {
    if (!this.slaveObj.slave_position || !this.slaveObj.slave_category) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Slave Position');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService
        .createModelSlavePosition(this.contextApp.app, this.assetModel.name, this.slaveObj)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Add Slave Position');
            this.isCreateSlaveAPILoading = false;
            this.onCloseModal('addSlaveModal');
            this.getSlavePositions();
            this.slaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Add Slave Position');
            this.isCreateSlaveAPILoading = false;
          }
        )
    );
  }

  updateSlavePositionObj() {
    if (!this.slaveObj.slave_position || !this.slaveObj.slave_category) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Update Slave Position');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService
        .updateModelSlavePosition(this.contextApp.app, this.assetModel.name, this.slaveObj.id, this.slaveObj)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Update Slave Position');
            this.isCreateSlaveAPILoading = false;
            this.onCloseModal('addSlaveModal');
            this.getSlavePositions();
            this.slaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Update Slave Position');
            this.isCreateSlaveAPILoading = false;
          }
        )
    );
  }

  deleteSlavePosition() {
    this.isDeleteSlaveAPILoading = true;
    this.subscriptions.push(
      this.assetModelService
        .deleteModelSlavePosition(this.contextApp.app, this.assetModel.name, this.deleteSlaveObj.id)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Delete Slave Position');
            this.isDeleteSlaveAPILoading = false;
            this.onCloseModal('confirmMessageModal');
            this.getSlavePositions();
            this.deleteSlaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Delete Position');
            this.isDeleteSlaveAPILoading = false;
          }
        )
    );
  }

  saveSlaveCategoryObj() {
    if (!this.slaveObj.slave_category) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Add Slave Category');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.created_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService
        .createModelSlaveCategory(this.contextApp.app, this.assetModel.name, this.slaveObj)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Add Slave Category');
            this.isCreateSlaveAPILoading = false;
            this.onCloseModal('addSlaveModal');
            this.getSlaveCategories();
            this.slaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Add Slave Category');
            this.isCreateSlaveAPILoading = false;
          }
        )
    );
  }

  updateSlaveCategoryObj() {
    if (!this.slaveObj.slave_category) {
      this.toasterService.showError(UIMESSAGES.MESSAGES.ALL_FIELDS_REQUIRED, 'Update Slave Category');
      return;
    }
    this.isCreateSlaveAPILoading = true;
    this.slaveObj.updated_by = this.userData.email + ' (' + this.userData.name + ')';
    this.subscriptions.push(
      this.assetModelService
        .updateModelSlaveCategory(this.contextApp.app, this.assetModel.name, this.slaveObj.id, this.slaveObj)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Update Slave Category');
            this.isCreateSlaveAPILoading = false;
            this.onCloseModal('addSlaveModal');
            this.getSlaveCategories();
            this.slaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Update Slave Category');
            this.isCreateSlaveAPILoading = false;
          }
        )
    );
  }

  deleteSlaveCategory() {
    this.isDeleteSlaveAPILoading = true;
    this.subscriptions.push(
      this.assetModelService
        .deleteModelSlaveCategory(this.contextApp.app, this.assetModel.name, this.deleteSlaveObj.id)
        .subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Delete Slave Category');
            this.isDeleteSlaveAPILoading = false;
            this.onCloseModal('confirmMessageModal');
            this.getSlaveCategories();
            this.deleteSlaveObj = undefined;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Delete Slave Category');
            this.isDeleteSlaveAPILoading = false;
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

  onTableFunctionCall(obj) {
    if (obj.for === 'Edit') {
      this.updateSlaveInfoInModal(obj.data);
    } else if (obj.for === 'Delete') {
      this.modalConfig = {
        stringDisplay: true,
        isDisplaySave: true,
        isDisplayCancel: true,
      };
      this.openModal('confirmMessageModal');
      this.deleteSlaveObj = JSON.parse(JSON.stringify(obj.data));
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
