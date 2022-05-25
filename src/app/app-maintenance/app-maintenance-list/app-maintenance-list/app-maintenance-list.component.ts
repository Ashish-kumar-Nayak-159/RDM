import { Component, OnInit , ViewChild} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { HttpErrorResponse } from '@angular/common/http';
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
  assetDropdown: any[] = [];
  assetsdata: any = {
    asset_name: '',
    asset_id:'',
    asset_type:''
  };
 
  maintenanceModel:any;
  userData: any;
  apiSubscriptions: Subscription[] = [];
  tableConfig: any;
  maintenances: any = [];
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
  htmlContent:any;
  dateTime1:any;
  dateTime2:any;
  dateTime3:any;
  notifyUser:any;
  escalRequired:any;
  askRequired:any;
  createMaitenanceCall = false;

  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;

  constructor(
    private commonService:CommonService,
    private assetService: AssetService,
    private maintenanceService: MaintenanceService,
    private toasterService: ToasterService) { }
 
  
 
  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    this.getAssets(this.contextApp.user.hierarchy);
    this.getMaintenance();
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'table_class',
      no_data_message: '',
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
              icon: 'fas fa-fw fa-toggle-off',
              text: '',
              id: 'Disable',
              valueclass: '',
              tooltip: 'Disable',
            },
           
          ],
        },
      ],
    };
  }
  onChangeOfSendNotifyAlertCheckbox()
  {

  }
  //getting data list from maintenance APi
  getMaintenance(){
       this.maintenanceService.getMaintenance().subscribe((response:any)=>{
           console.log("maintenance",response)
         this.maintenances = response.data
       },(err)=>{
         console.log("err while calling maintenance api",err)
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
          debugger
          for(var i=0;i<this.assets.length;i++)
          {
            this.assetsdata ={
              asset_name :this.assets[i].display_name,
              asset_id : this.assets[i].asset_id,
              asset_type:this.assets[i].type
            };
             this.assetDropdown.push(this.assetsdata);
          }
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
onCloseMaintenanceModelModal() {
  $('#createMaintainenceModelModal').modal('hide');
 
}
onSaveMaintenanceModelModal()
{
  this.createMaitenanceCall = true;
    this.maintenanceModel.created_by = this.userData.email + ' (' + this.userData.name + ')';
     this.maintenanceModel.updated_by = this.userData.email + ' (' + this.userData.name + ')';
      let method = this.assetService.createNewMaintenanceRule(this.maintenanceModel);
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          this.toasterService.showSuccess(response.message,   'Maitenance Create');
          $('#createMaintainenceModelModal').modal('hide');
          this.createMaitenanceCall = false;
        },
        (err: HttpErrorResponse) => {
          this.createMaitenanceCall = false;
          this.toasterService.showError(err.message," Maitenance Create");
        }
      );
  
}


 /////// To open the Modal for the Maintenance Schedule
 async openCreateMaintenanceModelModal(obj = undefined) {
  $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
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

onChangeOfAsset(){
  const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);

}


// this function will call when someone click on icons [Ex. delete, edit, toggle]
onTableFunctionCall(obj){
  if (obj.for === 'View') {
    console.log('view :',obj);
  }
  else if (obj.for === 'Delete') {
    this.maintenanceService.deleteMaintenance(obj?.data.maintenance_registry_id).subscribe((response)=>{
      console.log("del response", response)
      this.getMaintenance();
    })

  }
  else if (obj.for === 'Disable') {
    this.openConfirmDialog("Disable")
    this.maintenanceService.enableDisable(obj.maintenance_registry_id).subscribe((res)=>{
      console.log("enable/disable",res);
      
   })
  }
  else if (obj.for === 'EditPrivilege') {
  }else if (obj.for === 'Un Provision'){
  }
}

// showing and hiding modal
onModalEvents(eventType) {
  if(eventType === 'save'){
   console.log("saying yes")
  
   $("#confirmMessageModal").modal('hide');
  }
  else{
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
    this.confirmBodyMessage = 'Are you sure you want to enable this asset?';
    this.confirmHeaderMessage = 'Enable ' + 'Asset';
  } else if (type === 'Disable') {
    this.confirmBodyMessage =
      'This ' +
     'Asset' +
      ' will be temporarily disabled. Are you sure you want to continue?';
    this.confirmHeaderMessage = 'Disable ' +  'Asset';
  } else if (type === 'Deprovision') {
    this.confirmHeaderMessage = 'Deprovision ' + 'Asset';
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


}
