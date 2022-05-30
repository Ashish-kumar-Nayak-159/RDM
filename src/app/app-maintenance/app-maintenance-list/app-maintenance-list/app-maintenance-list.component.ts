import { Component, ElementRef, OnInit ,Input, Output,ViewChild} from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Maintenanace} from "src/app/app-maintenance/Maintenanace";
import { Router } from '@angular/router';


declare var $: any;

@Component({
  selector: 'app-app-maintenance-list',
  templateUrl: './app-maintenance-list.component.html',
  styleUrls: ['./app-maintenance-list.component.css']
})

export class AppMaintenanceListComponent implements OnInit {
  userGroupArray :any [] = [];
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
  validEmail = true;
  isView = false;
  htmlContent:any;
  emailbody1:any;
  currentItem:any;
  selectedAsset_id : any;
  maintenanceModel:Maintenanace = new Maintenanace();
  userData: any;
  maintenance_registry_id : any;

  htmlEmailContent:any;
  notifyUser:any;
  escalRequired:any;
  askRequired:any;
  is_escalation_required = false;
  createMaitenanceCall = false;
  notifyMaintenanceForm : FormGroup;
  createMaintenanceForm : FormGroup;
  escalMaintenanceForm : FormGroup;
  maintenanceFormEdit : FormGroup;
  descContent:any;
  maintenance_Sdate:any;
  is_notify_user = false;
  inspection_frequency:any;
  notifyBefore:any;
  notify_user_emails?:any;
  notify_email_subject:any;
  notify_email_body:any;
  is_acknowledge_required = false;
  
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
  title:any;
  maintenanceRegistryId:number;
  isMaintenanceRequired:boolean;
  payload:any;
  maintenanceForm = new FormGroup({
    dateAndTime: new FormControl('',Validators.required)
  })
  disableBeforeDate:any = new Date().toISOString().slice(0,16)
  isEdit = false;
  itemArray:any [] = [];
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;

  constructor(
    private commonService:CommonService,
    private assetService: AssetService,
    private maintenanceService: MaintenanceService,
    private toasterService: ToasterService,
    private router:Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.maintenanceModel = {
      asset_id:'',
      is_maintenance_required: true,
      name :'',
      htmlEmailContent:'',
      description:'',
      start_date :'',
      inspection_frequency :0,
      is_notify_user:false,
      notify_before_hours:2,
      notify_user_emails : null,
      notify_email_subject :'',
      notify_email_body:'',
      notify_user_groups:'',
      is_acknowledge_required :false,
      is_escalation_required :false,
      maintenance_escalation_registry :[{
        user_emails: '',
        duration_hours: "",
        user_groups:"",
        email_subject:"",
        email_body:"",
      }],
      email_body : ''
    
    };
    this.getTileName();
    this.getMaitenanceModel();
    this.getUserGroup();
    this.getAssets(this.contextApp.user.hierarchy);
   
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
    this.itemArray.push({
      "name":"Daily",
      id:0
    },
    {
      "name":"Weekly",
      id:1
    },
    {
      "name":"BiWeekly",
      id:2
    },
    {
      "name":"Monthly",
      id:3
    },
    {
      "name":"Quarterly",
      id:4
    },
    {
      "name":"Yearly",
      id:5
    })
  }
  addNewEsacalation() {
    let maintenance_regirstry ={
    user_emails: '',
    duration_hours: "",
    user_groups:"",
    email_subject:"",
    email_body:"",
    }    
    this.maintenanceModel.maintenance_escalation_registry.push(maintenance_regirstry);
  }
  deleteEscalation(index) {
    this.maintenanceModel.maintenance_escalation_registry.splice(index, 1);
  }
  getUserGroup()
  {
    let method = this.maintenanceService.getUserGroup(this.contextApp.app);
    method.subscribe(
      (response: any) => {
        for(var i=0;i<response.data.length;i++)
        {
          this.userGroupArray.push({
            group_name: response.data[i]?.group_name,
            id:response.data[i]?.id
        } );
      }
      },
    );
  }
  validateEmails_eas(j)
  {
    this.notify_user_emails = this.maintenanceModel.maintenance_escalation_registry[j]?.user_emails;
    if(this.notify_user_emails!==undefined)
    {
      var emails =  this.notify_user_emails.replace(/\s/g,'').split(",");
      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
 
      for (var i = 0; i < emails.length; i++) {
           if( emails[i] == "" || ! regex.test(emails[i])){
              this.validEmail = false;
           }
           else
           {
            this.validEmail = true;
           }
      }
    }
  }
  validateEmails(event)
  {
   
    this.notify_user_emails = this.notifyMaintenanceForm.get('notify_user_emails').value;
    if(this.notify_user_emails!==undefined)
    {
      var emails =  this.notify_user_emails.replace(/\s/g,'').split(",");
      var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
 
      for (var i = 0; i < emails.length; i++) {
           if( emails[i] == "" || ! regex.test(emails[i])){
              this.validEmail = false;
           }
           else
           {
            this.validEmail = true;
           }
      }
    }
  }
  //getting data list from maintenance APi
  getMaintenance(){
       this.maintenanceService.getMaintenance().subscribe((response:any)=>{
           console.log("maintenance",response)
           response.data.forEach((item)=>{
             item.start_date = this.commonService.convertUTCDateToLocalDate(item.start_date,"MMM dd, yyyy, HH:mm:ss aaaaa'm'")
           })
            
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
  this.createMaintenanceForm.reset();
  $('#createMaintainenceModelModal').modal('hide');
 
}
getMaitenanceModel()
{
  this.createMaintenanceForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
    asset_id: new FormControl('', [Validators.required]),
    start_date: new FormControl('', [Validators.required]),
    inspection_frequency: new FormControl('',[Validators.required]),
    })

  this.notifyMaintenanceForm = new FormGroup({
      notifyBefore: new FormControl('', [Validators.required]),
      notify_user_emails: new FormControl('', [Validators.required]),
      notify_email_subject: new FormControl('', [Validators.required]),
      })
   
      
}

emailBodyDetect(valuefromtextEditor:any) {
  this.htmlContent = valuefromtextEditor;
}
emailBody1Detect(valuefromtextEditor:any,i)
{
  this.emailbody1 = valuefromtextEditor;
  this.maintenanceModel.maintenance_escalation_registry[i].email_body= this.emailbody1; 
}

onSaveMaintenanceModelModal()
{
  this.createMaitenanceCall = true;
  if((this.createMaintenanceForm.get("name").value===undefined || this.createMaintenanceForm.get("name").value==='')
   || (this.createMaintenanceForm.get("asset_id").value===undefined || this.createMaintenanceForm.get("name").value==='')
   || (this.createMaintenanceForm.get("start_date").value===undefined || this.createMaintenanceForm.get("start_date").value==='') 
   || (this.createMaintenanceForm.get("inspection_frequency").value===undefined || this.createMaintenanceForm.get("inspection_frequency").value==='')
   ) {this.createMaitenanceCall = false;
    this.toasterService.showError('Please Enter mandatory information'," Maitenance Create");
    return;
  }
  let maintenance_escalation_registry :any [] = [];
  this.maintenanceModel.maintenance_escalation_registry?.forEach((element)=>
  {
  if(element.user_emails!==undefined && element.user_emails!='')
  {
    maintenance_escalation_registry.push({
      "user_emails":element?.user_emails?.split(","),
        "user_groups":element?.user_groups,
        "email_body":element?.email_body,
        "email_subject":element?.email_subject,
        "duration_hours":element?.duration_hours
      })
      
  }
    
  })
  this.maintenanceModel = this.createMaintenanceForm.value;
  this.maintenanceModel.is_maintenance_required = true;
  this.maintenanceModel.is_notify_user = this.is_notify_user;
  this.maintenanceModel.is_escalation_required = this.is_escalation_required;
  this.maintenanceModel.is_acknowledge_required = this.is_acknowledge_required;
  this.maintenanceModel.description = this.descContent;
  if(this.is_notify_user)
  {
    this.maintenanceModel.notify_before_hours = this.notifyMaintenanceForm.get('notifyBefore').value;
    this.maintenanceModel.notify_user_emails =  this.notifyMaintenanceForm.get('notify_user_emails').value.split(',');
    this.maintenanceModel.notify_email_subject = this.notifyMaintenanceForm.get('notify_email_subject').value;
  }
  this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
  this.maintenanceModel.notify_email_body = this.htmlContent;
  if(this.isEdit)
  {
  
    let method = this.maintenanceService.updateNewMaintenanceRule(this.maintenance_registry_id,this.maintenanceModel);
    method.subscribe(
      (response: any) => {
        // this.onCloseRuleModel.emit({
        //   status: true,
        // });
        this.toasterService.showSuccess(response.message,   'Maitenance Update');
        $('#createMaintainenceModelModal').modal('hide');
        this.isEdit = false;
        this.createMaitenanceCall = false;
        this.redirectTo(this.router.url);
      },
      (err: HttpErrorResponse) => {
        this.createMaitenanceCall = false;
        this.toasterService.showError(err.message," Maitenance Update");
      }
    );
  }
  else
  {
    let method = this.maintenanceService.createNewMaintenanceRule(this.contextApp,"CreateMaintenance",this.maintenanceModel);
    method.subscribe(
      (response: any) => {
        // this.onCloseRuleModel.emit({
        //   status: true,
        // });
        this.toasterService.showSuccess(response.message,   'Maitenance Create');
        $('#createMaintainenceModelModal').modal('hide');
        this.createMaitenanceCall = false;
        this.redirectTo(this.router.url);
      },
      (err: HttpErrorResponse) => {
        this.createMaitenanceCall = false;
        this.toasterService.showError(err.message," Maitenance Create");
      }
    );
  }
}
redirectTo(uri:string){
  this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
  this.router.navigate([uri]));
}


 /////// To open the Modal for the Maintenance Schedule
 async openCreateMaintenanceModelModal(obj = undefined) {
   this.title = "Add";
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
getInspec_Freq(inspection_frequency)
{
  let itemObj = this.itemArray.find(item => item.id === inspection_frequency);
 return itemObj?.name;
}
onCloseViewMaintenanceModelModal()
{
  $("#viewMaintainenceModelModal").modal('hide');
}
getMaintenance_data(id)
{
  let method = this.maintenanceService.getMaintenancedata(id);
  method.subscribe(
    (response: any) => {
        this.maintenanceModel = response.data;
    },
  );

}
setEditFields()
{
  this.isEdit = true;
  this.is_acknowledge_required = this.maintenanceModel.is_acknowledge_required;
  this.is_notify_user = this.maintenanceModel.is_notify_user;
  this.is_escalation_required = this.maintenanceModel.is_escalation_required;
  this.createMaintenanceForm.get('asset_id').setValue(this.maintenanceModel.asset_id);
  this.createMaintenanceForm.get('name').setValue(this.maintenanceModel.name);
  this.descContent = this.maintenanceModel.description;
  this.createMaintenanceForm.get('start_date').setValue(this.maintenanceModel.name);
  this.inspection_frequency = this.maintenanceModel.inspection_frequency;
  if(this.is_notify_user)
  {
    this.notifyMaintenanceForm.get('notifyBefore').setValue(this.maintenanceModel?.notify_before_hours);
    this.notifyMaintenanceForm.get('notify_email_subject').setValue(this.maintenanceModel?.notify_email_subject);
    let emails = this.maintenanceModel?.notify_user_emails[0];
    this.currentItem = this.maintenanceModel.notify_email_body;
    for(var i=1;i<this.maintenanceModel?.notify_user_emails?.length;i++)
    {
      emails = emails +"," + this.maintenanceModel?.notify_user_emails[i];
    }
    this.notifyMaintenanceForm.get('notify_user_emails').setValue(emails);
  }
  if(this.is_escalation_required)
  {

    let maintenance_escalation_registry = [];
    this.maintenanceModel.maintenance_escalation_registry.forEach((element)=>{
      let emails = element.user_emails[0];
      for(var i=1;i<element.user_emails.length;i++)
      {
        emails = emails +"," + element.user_emails[i];
      }
      
      maintenance_escalation_registry.push({
        "user_emails":emails,
        "user_groups":element.user_groups,
        "email_body":element.email_body,
        "email_subject":element.email_subject,
        "duration_hours":element.duration_hours
      })
      this.currentItem = element.email_body;
    });
    this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
  }

}
// this function will call when someone click on icons [Ex. delete, edit, toggle]
onTableFunctionCall(obj){
  if (obj.for === 'View') {
    this.isView = !this.isView;
    this.maintenance_registry_id = obj?.data.maintenance_registry_id;
    $("#viewMaintainenceModelModal").modal('show');
    this.getMaintenance_data(this.maintenance_registry_id);
  }
  else if (obj.for === 'Delete') {
    this.openConfirmDialog("Delete")
    this.maintenanceRegistryId = obj?.data.maintenance_registry_id
    // this.maintenanceService.deleteMaintenance(obj?.data.maintenance_registry_id).subscribe((response)=>{
    //   console.log("del response", response)
    //   this.getMaintenance();
    // })

  }
  else if (obj.for === 'Disable') {

    console.log("disable",obj)
    this.maintenanceRegistryId = obj?.data?.maintenance_registry_id
    this.isMaintenanceRequired = obj?.data?.is_maintenance_required
    if(!(this.isMaintenanceRequired)){
      $("#exampleModal").modal('show');
    }
    else{
      this.payload = {
        is_maintenance_required : ! this.isMaintenanceRequired,
  
      }
      this.maintenanceService.enableDisable(this.maintenanceRegistryId).subscribe((response)=>{
        console.log("disable",response)
        this.getMaintenance();
       this.toasterService.showSuccess('maintenance disabled successfully !','Maintenance Edit')
     })
    }
    
    // this.payload = {
    //   is_maintenance_required : !obj.data.is_maintenance_required,
    //   start_date : "2022-05-30 13:00"
    // }
  }
  else if (obj.for === 'Edit') {
    this.onCloseMaintenanceModelModal();
    this.isEdit = true;
    this.title = "Edit";
    this.maintenance_registry_id = obj?.data.maintenance_registry_id;
    this.getMaintenance_data(this.maintenance_registry_id);
    setTimeout(() => {
      this.setEditFields();
     }, 1000);
    $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }else if (obj.for === 'Un Provision'){
  }
}
onEditSave()
{}
// showing and hiding modal
onModalEvents(eventType) {
  if(eventType === 'save'){
  //  this.maintenanceService.disable(this.maintenanceRegistryId,this.payload).subscribe((response)=>{
  //     console.log("enable/disable",response)
  //  })
  this.maintenanceService.deleteMaintenance(this.maintenanceRegistryId).subscribe((response:any)=>{
    console.log("del response", response)
    this.getMaintenance();
    this.toasterService.showSuccess('maintenance deleted successfully !','Maintenance Delete')
  })
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
    this.confirmBodyMessage = 'Are you sure you want to enable this maintenance?';
    this.confirmHeaderMessage = 'Enable ' + 'Maintenance';
  }else if(type=== 'Delete'){
    this.confirmBodyMessage = 'Are you sure you want to delete this maintenance?';
    this.confirmHeaderMessage = 'Delete ' + 'Maintenance';
  }
  else if (type === 'Disable') {
    this.confirmBodyMessage =
      'This ' +
     'Maintenance' +
      ' will be temporarily disabled. Are you sure you want to continue?';
    this.confirmHeaderMessage = 'Disable ' +  'Maintenance';
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

onSave(){
  console.log("date&Time",this.maintenanceForm.value.dateAndTime)
  this.payload = {
    is_maintenance_required : ! this.isMaintenanceRequired,
    start_date : this.maintenanceForm.value.dateAndTime
  }
   this.maintenanceService.enableDisable(this.maintenanceRegistryId).subscribe((response)=>{
      console.log("enable",response)
      this.maintenanceForm.reset();
      this.toasterService.showSuccess('maintenance enable successfully !','Maintenance Edit')
      this.getMaintenance();
   },(error:any)=>{
       console.log("enable error",error)
       this.toasterService.showError(`${error.message}`,'Maintenance edit')
   })
  $("#exampleModal").modal('hide');
  this.maintenanceForm.reset();
}


}
