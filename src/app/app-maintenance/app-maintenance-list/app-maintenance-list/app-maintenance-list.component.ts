import { Component, OnInit ,Input, ViewChild} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { Subscription } from 'rxjs';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AssetService } from 'src/app/services/assets/asset.service';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { HttpErrorResponse } from '@angular/common/http';
import { isThisMinute } from 'date-fns';
import {Maintenanace} from "src/app/app-maintenance/maintenanace/maintenanace.model";
import { truncateWithEllipsis } from '@amcharts/amcharts4/.internal/core/utils/Utils';
declare var $: any;

@Component({
  selector: 'app-app-maintenance-list',
  templateUrl: './app-maintenance-list.component.html',
  styleUrls: ['./app-maintenance-list.component.css']
})

export class AppMaintenanceListComponent implements OnInit {
  tileData: any;
  contextApp: any;
  @Input() isModel: any;
  @Input() asset: any;
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
  selectedAsset_id : any;
  maintenanceModel:Maintenanace = new Maintenanace();
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
  htmlEmailContent:any;
  dateTime1:any;
  dateTime2:any;
  dateTime3:any;
  escalRequired = false;
  is_escalation_required = false;
  createMaitenanceCall = false;
  createMaintenanceForm : FormGroup;
  maintenance_escalation_registry : any [] = [];
  maintenance_name : any;
  descContent:any;
  maintenance_Sdate:any;
  is_notify_user = false;
  inspection_frequency:any;
  notifyBefore:any;
  notify_user_emails:any;
  notify_email_subject:any;
  notify_email_body:any;
  is_acknowledge_required:any;
  escalation_emailids1:any;
  escalation_emailids2:any;
  escalation_emailids3:any;
  maintenance_regirstry= {};
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
    this.getMaitenanceModel();
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
  getMaitenanceModel()
  {
    this.createMaintenanceForm = new FormGroup({
      maintenance_name: new FormControl(null, [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
      selectedAsset_id: new FormControl(null, [Validators.required]),
      is_notify_user: new FormControl(null),
      is_acknowledge_required: new FormControl(null),
      is_escalation_required: new FormControl(null),
      maintenance_Sdate: new FormControl(null, [Validators.required]),
      inspection_frequency: new FormControl(null,[Validators.required]),
      })
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
  this.getMaitenanceModel();
  alert(this.selectedAsset_id);
  if(this.selectedAsset_id)
  {
      this.maintenanceModel.asset_id = this.selectedAsset_id;
      this.maintenanceModel.is_maintenance_required = true;
      this.maintenanceModel.name = this.maintenance_name;
      this.maintenanceModel.htmlEmailContent = this.htmlEmailContent;
      this.maintenanceModel.description = this.descContent;
      this.maintenanceModel.start_date = this.maintenance_Sdate;
      this.maintenanceModel.inspection_frequency = this.inspection_frequency;
      this.maintenanceModel.is_notify_user = this.is_notify_user;
      this.maintenanceModel.notify_before_hours = this.notifyBefore;
      this.maintenanceModel.notify_user_emails = this.notify_user_emails;
      this.maintenanceModel.notify_email_subject = this.notify_email_subject;
      this.maintenanceModel.notify_email_body = this.notify_email_body;
      this.maintenanceModel.is_acknowledge_required = this.is_acknowledge_required;
      this.maintenanceModel.is_escalation_required = this.is_escalation_required;
      this.maintenance_regirstry = {
        "escalation_emailids1" : this.escalation_emailids1,
        "dateTime":this.dateTime1,
      };
      this.maintenance_escalation_registry.push(this.maintenance_regirstry);
      this.maintenance_regirstry = {
        "escalation_emailids2" : this.escalation_emailids2,
        "dateTime2":this.dateTime2,
      };
      this.maintenance_escalation_registry.push(this.maintenance_regirstry);
      this.maintenance_regirstry = {
        "escalation_emailids3" : this.escalation_emailids3,
        "dateTime3":this.dateTime3,
      };
      this.maintenance_escalation_registry.push(this.maintenance_regirstry);
      this.maintenanceModel.maintenance_escalation_registry = this.maintenance_escalation_registry;
      this.maintenanceModel.email_body = this.htmlEmailContent;
    }
     let method = this.assetService.createNewMaintenanceRule(this.contextApp.app,"CreateMaintenance",this.maintenanceModel);
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
