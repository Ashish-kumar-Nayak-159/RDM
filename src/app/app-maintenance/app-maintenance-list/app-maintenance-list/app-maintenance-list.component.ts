import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
declare var $: any;

@Component({
  selector: 'app-app-maintenance-list',
  templateUrl: './app-maintenance-list.component.html',
  styleUrls: ['./app-maintenance-list.component.css']
})
export class AppMaintenanceListComponent implements OnInit {
  tileData: any;
  contextApp: any;
  decodedToken: any;
  isFilterSelected = false;
  originalFilter: any;
  filterObj: any = {};
  assets: any[] = [];
  userData: any;
  apiSubscriptions: Subscription[] = [];
  tableConfig: any;
  maintenanceConfig:any;
  maintenances: any = [];
  maintenanceData:any = [];
  isApplicationListLoading = false;
  confirmBodyMessage: string;
  confirmHeaderMessage: string;
  isAPILoading = false;
  modalConfig: {
    isDisplaySave: boolean;
    isDisplayCancel: boolean;
    saveBtnText: string;
    cancelBtnText: string;
    stringDisplay: boolean;
  };
  maintenanceRegistryId: number;
  isMaintenanceRequired: boolean;
  payload: any;
  maintenanceForm = new FormGroup({
    dateAndTime: new FormControl('', Validators.required)
  })
  currentOffset = 0;
  currentLimit = 20;
  insideScrollFunFlag: false;
  disableBeforeDate: any = new Date().toISOString().slice(0, 16)
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private maintenanceService: MaintenanceService,
    private toasterService: ToasterService
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.getAssets(this.contextApp.user.hierarchy);
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'tableFixHead-assets-list',
      no_data_message: '',
      is_load_more_required: true,
      item_count: this.currentLimit,
      data: [
        {
          header_name: 'Asset Id',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'asset_id',
          //is_sort: true
        },
        {
          header_name: 'Name',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'name',
          //is_sort: true
        },
        {
          header_name: 'Inspection Frequency',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'inspection_frequency',
          value_class: '',
          data_tooltip: 'offline_since',
          data_cellclass: 'cssclass',
          //is_sort: true
        },
        {
          header_name: 'Start Date',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'start_date',
          data_tooltip: 'last_ingestion_on',
          data_cellclass: 'ingestionCss'
        },
        // {
        //   header_name: 'CreatedOn',
        //   value_type: 'string',
        //   // is_sort_required: true,
        //   fixed_value_list: [],
        //   data_type: 'text',
        //   data_key: 'created_date',
        //   //is_sort: true,
        //   sort_by_key: 'created_date_time'
        // },
        {
          header_name: 'Actions',
          key: undefined,
          data_type: 'button',
          btn_list: [
            {
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'View',
              valueclass: '',
              tooltip: 'View',
            },
            {
              icon: 'fa fa-fw fa-edit',
              text: '',
              id: 'Edit',
              valueclass: '',
              tooltip: 'Edit',
            },
            {
              icon: 'fa fa-fw fa-trash',
              text: '',
              id: 'Delete',
              valueclass: '',
              tooltip: 'Delete',
            },
            {
              icon: 'fa fa-fw fa-table',
              text: '',
              id: 'Trigger',
              valueclass: '',
              tooltip: 'Trigger',
            },
            {
              icon: 'fa fa-fw fa-clone',
              text: '',
              id: 'Clone',
              valueclass: '',
              tooltip: 'Clone',
            },
            {
              id: 'Disable',
              valueclass: '',
              tooltip: 'Disable',
              type: 'switch',
              data_key: 'is_maintenance_required'
            }
          ],
        },
      ],
    };
    this.getMaintenance();
  }

  //getting data list from maintenance APi
  getMaintenance() {
    this.maintenanceService.getMaintenance().subscribe((response: any) => {
      console.log("maintenance", response)
      response.data.forEach((item) => {
        item.start_date = this.commonService.convertUTCDateToLocalDate(item.start_date, "MMM dd, yyyy, HH:mm:ss aaaaa'm'")
      })

      this.maintenances = response.data
    }, (err) => {
      console.log("err while calling maintenance api", err)
    })
  }


  ////// Getting the Title name which we displayed in the Html Page
  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Maintenance') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve1) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
      this.apiSubscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            console.log('checkingassets', JSON.stringify(this.assets))
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
              this.onChangeOfAsset();
            }
          }
          resolve1();
        })
      );
    });
  }



  /////// To open the Modal for the Maintenance Schedule
  openMaintenanceCreateModal() {

  }

  /////  To Clear the Hierarchy from dropdown menu 
  onClearHierarchy() {
    this.isFilterSelected = false;
    this.originalFilter = JSON.parse(JSON.stringify(this.filterObj));
  }

  /////  While Click on the Save Hierarchy 
  onSaveHierachy() {
    this.originalFilter = {};
    if (this.filterObj.asset) {
      this.originalFilter.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
      this.onChangeOfAsset();
    }
  }

  onChangeOfAsset() {
    const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);

  }


  // this function will call when someone click on icons [Ex. delete, edit, toggle]
  onTableFunctionCall(obj) {

    if (obj.for === 'View') {
      console.log('view :', obj);
    }
    else if (obj.for === 'Delete') {

      this.openConfirmDialog("Delete")
      this.maintenanceRegistryId = obj?.data.maintenance_registry_id

    }
    else if (obj.for === 'Trigger') {

      this.maintenanceData = []
      $(".over-lap").css('display', 'block')
      this.setMaintenanceConfig();
      this.historyOfPerticularMaintenance(obj);

    }
    else if (obj.for === 'Disable') {
      console.log("disable", obj)
      this.maintenanceRegistryId = obj?.data?.maintenance_registry_id
      this.isMaintenanceRequired = obj?.data?.is_maintenance_required
      if (!(this.isMaintenanceRequired)) {
        $("#exampleModal").modal('show');
      }
      else {
        this.payload = {
          is_maintenance_required: !this.isMaintenanceRequired,
        }
        this.disableMaintenance(this.maintenanceRegistryId, this.payload)
      }
    }
    else if (obj.for === 'EditPrivilege') {
    } else if (obj.for === 'Un Provision') {
    }
  }

  // showing and hiding modal
  onModalEvents(eventType) {
    if (eventType === 'save') {
        this.deleteMaintenance();
        $("#confirmMessageModal").modal('hide');
    }
    else {
      $('#confirmMessageModal').modal('hide');
    }
  }

  openConfirmDialog(type) {
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true,
    };
    if (type === 'Enable') {
      this.confirmBodyMessage = 'Are you sure you want to enable this maintenance?';
      this.confirmHeaderMessage = 'Enable ' + 'Maintenance';
    } else if (type === 'Delete') {
      this.confirmBodyMessage = 'Are you sure you want to delete this maintenance?';
      this.confirmHeaderMessage = 'Delete ' + 'Maintenance';
    }
    else if (type === 'Disable') {
      this.confirmBodyMessage =
        'This ' +
        'Maintenance' +
        ' will be temporarily disabled. Are you sure you want to continue?';
      this.confirmHeaderMessage = 'Disable ' + 'Maintenance';
    } else if (type === 'Deprovision') {
      this.confirmHeaderMessage = 'Deprovision ' + 'Maintenance';
      // if (this.type !== CONSTANTS.NON_IP_ASSET) {
      //   this.confirmBodyMessage =
      //     'This ' +
      //     (this.tabData?.table_key || 'Asset') +
      //     ' will be permanently deleted. Instead, you can temporarily disable the ' +
      //     (this.tabData?.table_key || 'Asset') +
      //     '.' +
      //     ' Are you sure you want to continue?';
      // } else {
      //   this.confirmBodyMessage =
      //     'This ' +
      //     (this.tabData?.table_key || 'Asset') +
      //     ' will be permanently deleted.' +
      //     ' Are you sure you want to continue?';
      // }
    }
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  //showing this custom model when someone try to enable maintenance
  onSave() {
    console.log("date&Time", this.maintenanceForm.value.dateAndTime)
    this.payload = {
      is_maintenance_required: !this.isMaintenanceRequired,
      start_date: this.maintenanceForm.value.dateAndTime
    }
    this.enableMaintenance(this.maintenanceRegistryId, this.payload);
 
    $("#exampleModal").modal('hide');
    this.maintenanceForm.reset();
  }

 // set tableconfiguration for second screen
  setMaintenanceConfig(){
    this.maintenanceConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'tableFixHead-assets-list',
      no_data_message: '',
      is_load_more_required: true,
      // item_count: this.currentLimit,
      data: [
        {
          header_name: 'Email Subject',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'email_subject',
          //is_sort: true
        },
        {
          header_name: 'Notification Type',
          is_display_filter: true,
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'notification_type',
          //is_sort: true
        },
        {
          header_name: 'Status',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'status',
          value_class: '',
          data_tooltip: 'offline_since',
          data_cellclass: 'cssclass',
          //is_sort: true
        },
        {
          header_name: 'Trigger Date',
          value_type: 'string',
          // is_sort_required: true,
          fixed_value_list: [],
          data_type: 'text',
          data_key: 'trigger_date',
          data_tooltip: 'last_ingestion_on',
          data_cellclass: 'ingestionCss'
        },
        {
          header_name: 'Actions',
          key: undefined,
          data_type: 'button',
          btn_list: [
            {
              icon: 'fa fa-fw fa-clone',
              text: '',
              id: 'Acknowledge',
              valueclass: '',
              tooltip: 'Acknowledge',
              show_hide_data_key: 'acknowledged_required'
            },
          ],
        },
      ],
    };
  }

  // getting data for perticular maintenance when someone click on trigger btn
  historyOfPerticularMaintenance(obj){
    this.maintenanceService.Trigger(obj?.data?.maintenance_registry_id).subscribe((res:any) => {
      console.log("ApI Trigger response", res)
      this.maintenanceData = res.data;
      
    }, (error) => {
      console.log("error while triggering", error)
      this.toasterService.showError(`${error.message}`, 'Error')
    })
  }

  //disable maintenance
  disableMaintenance(maintenanceRegisterId:any, payload:any){
    this.maintenanceService.disable(maintenanceRegisterId, payload).subscribe((response) => {
      console.log("disable", response)
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance disabled successfully !', 'Maintenance Edit')
    })
  }

  //enable maintenance
  enableMaintenance(maintenanceRegisterId:any, payload:any){
    this.maintenanceService.disable(maintenanceRegisterId, payload).subscribe((response) => {
      console.log("enable", response)
      this.maintenanceForm.reset();
      this.toasterService.showSuccess('maintenance enable successfully !', 'Maintenance Edit')
      this.getMaintenance();
    }, (error: any) => {
      console.log("enable error", error)
      this.toasterService.showError(`${error.message}`, 'Maintenance edit')
    })
  }

  //delete maintenance
  deleteMaintenance(){
    this.maintenanceService.deleteMaintenance(this.maintenanceRegistryId).subscribe((response: any) => {
      console.log("del response", response)
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance deleted successfully !', 'Maintenance Delete')
    })  
  }

  searchAssets(updateFilterObj = true) {
  }

  //redirect you to maintenance list screen
  backToMain() {
    $(".over-lap").css('display', 'none')
  }

}
