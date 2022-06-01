import { Component, ElementRef, OnInit, Input, Output, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { HierarchyDropdownComponent } from 'src/app/common/hierarchy-dropdown/hierarchy-dropdown.component';
import { Subscription } from 'rxjs';
import { AssetService } from 'src/app/services/assets/asset.service';
import { MaintenanceService } from 'src/app/services/maintenance/maintenance.service';
import { ToasterService } from 'src/app/services/toaster.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Maintenanace } from "src/app/app-maintenance/Maintenanace";
import { Router } from '@angular/router';


declare var $: any;

@Component({
  selector: 'app-app-maintenance-list',
  templateUrl: './app-maintenance-list.component.html',
  styleUrls: ['./app-maintenance-list.component.css']
})

export class AppMaintenanceListComponent implements OnInit {
  userGroupArray: any[] = [];
  appObj: { group_name?: string; recipients?: any[]; email?: any[]; sms?: any[]; whatsapp?: any[];push_notification?: any[] };
  groupObj: { group_name?: string; recipients?: {}; email?: any[]; sms?: any[]; whatsapp?: any[]; push_notification?: any[] };
  isAddUserGroup = false;
  userGroups: any[] = [];
  recipientemail: any = {};
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
    asset_id: '',
    asset_type: ''
  };
  validEmail = true;
  isView = false;
  htmlContent: any;
  emailbody1: any;
  currentItem: any;
  selectedAsset_id: any;
  maintenanceModel: Maintenanace = new Maintenanace();
  userData: any;
  maintenance_registry_id: any;

  htmlEmailContent: any;
  notifyUser: any;
  escalRequired: any;
  askRequired: any;
  is_escalation_required = false;
  createMaitenanceCall = false;
  notifyMaintenanceForm : FormGroup;
  createMaintenanceForm : FormGroup;
  escalMaintenanceForm : FormGroup;
  maintenanceFormEdit : FormGroup;
  description:any;
  maintenance_Sdate:any;
  is_notify_user = false;
  inspection_frequency: any;
  notifyBefore: any;
  notify_user_emails?: any;
  notify_email_subject: any;
  notify_email_body: any;
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
  title: any;
  maintenanceRegistryId: number;
  isMaintenanceRequired: boolean;
  payload: any;
  maintenanceForm = new FormGroup({
    dateAndTime: new FormControl('', Validators.required)
  })
  disableBeforeDate: any = new Date().toISOString().slice(0, 16)
  isEdit = false;
  insideScrollFunFlag: false;
  viewAckMaintenanceDetails: any = [];
  itemArray: any[] = [];
  @ViewChild('hierarchyDropdown') hierarchyDropdown: HierarchyDropdownComponent;
  maintenanceConfig: any;
  maintenanceData: any = [];
  asset_id: string = ''
  showAckModal: boolean = false;
  showViewAckModal: boolean = false;
  maintenanceNotificationId: number;
  currentOffset = 0;
  currentLimit = 20;

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private maintenanceService: MaintenanceService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.maintenanceModel = {
      asset_id: '',
      is_maintenance_required: true,
      name: '',
      htmlEmailContent: '',
      description: '',
      start_date: '',
      inspection_frequency: 0,
      is_notify_user: false,
      notify_before_hours: 2,
      notify_user_emails: null,
      notify_email_subject: '',
      notify_email_body: '',
      notify_user_groups: '',
      is_acknowledge_required: false,
      is_escalation_required: false,
      maintenance_escalation_registry: [{
        user_emails: '',
        user_email:[],
        duration_hours: "",
        user_groups: "",
        email_subject: "",
        email_body: "",
      }],
      email_body: ''

    };
    this.getTileName();
    this.getMaitenanceModel();
    this.getUserGroup();
    
    this.getAssets(this.contextApp.user.hierarchy);
    this.getGateWayandAssets(this.contextApp.user.hierarchy);
    this.getgateway(this.contextApp.user.hierarchy);
    this.tableConfig = {
      type: 'Applications',
      is_table_data_loading: this.isApplicationListLoading,
      table_class: 'tableFixHead-assets-list',
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
      "name": "Daily",
      id: 0
    },
      {
        "name": "Weekly",
        id: 1
      },
      {
        "name": "Biweekly",
        id: 2
      },
      {
        "name": "Monthly",
        id: 3
      },
      {
        "name": "Quarterly",
        id: 4
      },
      {
        "name": "Yearly",
        id: 5
      })
  }
  addNewEsacalation() {
    let maintenance_regirstry = {
      user_emails: '',
      user_email:[],
      duration_hours: "",
      user_groups: "",
      email_subject: "",
      email_body: "",
    }
    this.maintenanceModel.maintenance_escalation_registry.push(maintenance_regirstry);
  }
  deleteEscalation(index) {
    this.maintenanceModel.maintenance_escalation_registry.splice(index, 1);
  }
  getUserGroup() {
    let method = this.maintenanceService.getUserGroup(this.contextApp.app);
    method.subscribe(
      (response: any) => {
        for (var i = 0; i < response.data.length; i++) {
          this.userGroupArray.push({
            group_name: response.data[i]?.group_name,
            id: response.data[i]?.id
          });
        }
      },
    );
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
  
  
getgateway(hierarchy)
{
 
  const obj = {
    hierarchy: JSON.stringify(hierarchy),
    type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET + ','
  };
  this.assetService.getGateWAy(obj).subscribe((response: any) => {
    if (response?.data) {
      for (var i = 0; i < response?.data.length; i++) {
       
        this.assetDropdown.push( {
          asset_name: response?.data[i].display_name,
          asset_id: response?.data[i].asset_id,
          asset_type: response?.data[i].type
        });
        }
      }
  });
  
}

  getGateWayandAssets(hierarchy)
  {

      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
// Get all Assets for display
     this.assetService.getAllGatewaysAndAssetsList(obj, this.contextApp.app).subscribe((response: any) => {
    if (response?.data) {
      for (var i = 0; i < response?.data.length; i++) {
        this.assetsdata = {
          asset_name: response?.data[i].display_name,
          asset_id: response?.data[i].asset_id,
          asset_type: response?.data[i].type
             };
               this.assetDropdown.push(this.assetsdata);
            }
         }
        });
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
          if (this.assets?.length === 1) {
            this.filterObj.asset = this.assets[0];
            this.onChangeOfAsset();
          }
        }))
        resolve1();
      
      })

}
onCloseMaintenanceModelModal() {
  this.createMaintenanceForm.reset();
  this.maintenanceForm.reset();
  this.notifyMaintenanceForm.reset();
  this.maintenanceModel.maintenance_escalation_registry = [];
  $('#createMaintainenceModelModal').modal('hide');
 
}
getMaitenanceModel()
{
  this.createMaintenanceForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
    asset_id: new FormControl('', [Validators.required]),
    start_date: new FormControl('', [Validators.required]),
    inspection_frequency: new FormControl('',[Validators.required]),
    description:new FormControl('')
    })

    this.notifyMaintenanceForm = new FormGroup({
      notifyBefore: new FormControl('', [Validators.required]),
      notify_user_emails: new FormControl('', [Validators.required]),
      notify_email_subject: new FormControl('', [Validators.required]),
    })


  }

  emailBodyDetect(valuefromtextEditor: any) {
    this.htmlContent = valuefromtextEditor;
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
    if(element.user_email!==undefined && element.user_email[0]!='')
    {
      maintenance_escalation_registry.push({
        "user_emails":element?.user_email,
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
    if(this.is_notify_user)
    {
      this.maintenanceModel.notify_before_hours = this.notifyMaintenanceForm.get('notifyBefore').value;
      this.maintenanceModel.notify_user_emails =  this.notifyEmails;
      this.maintenanceModel.notify_email_subject = this.notifyMaintenanceForm.get('notify_email_subject').value;
    }
    this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    this.maintenanceModel.notify_email_body = this.htmlContent;
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
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

isAsset = false;
 /////// To open the Modal for the Maintenance Schedule
 async openCreateMaintenanceModelModal(obj = undefined) {
   this.title = "Add";
   this.isView = false;
   this.isAsset = true;
   this.notifyEmails = [];
   this.emails = [];
   if(this.createMaintenanceForm !== undefined)
   { 
     this.createMaintenanceForm.reset();
     this.createMaintenanceForm.get('asset_id').enable()
     this.createMaintenanceForm.get('start_date').enable();
   }
   if(this.notifyMaintenanceForm !== undefined)
   { 
     this.notifyMaintenanceForm.reset();
   }
   if(this.escalMaintenanceForm !== undefined)
   { 
     this.escalMaintenanceForm.reset();
   }
   this.is_notify_user = false;
   this.is_acknowledge_required = false;
   this.is_escalation_required = false;
  
  $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
  
   }
   emails = [];
   addEmailRecipient(index) {
    
    if (!this.emails) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
      if (!CONSTANTS.EMAIL_REGEX.test(this.maintenanceModel.maintenance_escalation_registry[index].user_emails)) {
        this.maintenanceModel.maintenance_escalation_registry[index].user_emails = '';
        this.toasterService.showError('Email address is not valid', 'Add Email');
        return;
      }
      if (this.emails.includes(this.maintenanceModel.maintenance_escalation_registry[index].user_emails)) {
        this.maintenanceModel.maintenance_escalation_registry[index].user_emails = '';
        this.toasterService.showError('Email address is already added', 'Add Email');
        return;
      }
      this.emails.push(this.maintenanceModel.maintenance_escalation_registry[index].user_emails);
      this.maintenanceModel.maintenance_escalation_registry[index].user_email.push(this.maintenanceModel.maintenance_escalation_registry[index].user_emails);
      this.maintenanceModel.maintenance_escalation_registry[index].user_emails = '';
    }
  }


  removeEmailRecipient(index) {
    this.emails.splice(index);
    this.maintenanceModel.maintenance_escalation_registry[index].user_email.splice(index);
  }
  notifyEmails = [];
  addEmailNotifyRecipient() {
    if (!this.notifyEmails) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
      if (!CONSTANTS.EMAIL_REGEX.test(this.notifyMaintenanceForm.get('notify_user_emails').value)) {
        this.notifyMaintenanceForm.get('notify_user_emails').setValue('')
        this.toasterService.showError('Email address is not valid', 'Add Email');
        return;
      }
      if (this.notifyEmails.includes(this.notifyMaintenanceForm.get('notify_user_emails').value)) {
        this.notifyMaintenanceForm.get('notify_user_emails').setValue('')
        this.toasterService.showError('Email address is already added', 'Add Email');
        return;
      }
      this.notifyEmails.push(this.notifyMaintenanceForm.get('notify_user_emails').value);
      this.notifyMaintenanceForm.get('notify_user_emails').setValue('')
  
    }
  }


  removeEmailNotifyRecipient(index) {
    this.notifyEmails.splice(index);
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
  this.createMaintenanceForm.reset();
  $('#createMaintainenceModelModal').modal('hide'); 
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

  

  

  /////  To Clear the Hierarchy from dropdown menu 
  //  onClearHierarchy() {
  //   this.isFilterSelected = false;
  //   this.originalFilter = JSON.parse(JSON.stringify(this.filterObj));
  // }

  /////  While Click on the Save Hierarchy 
  // onSaveHierachy() {
  //   this.originalFilter = {};
  //   if (this.filterObj.asset) {
  //     this.originalFilter.asset = JSON.parse(JSON.stringify(this.filterObj.asset));
  //     this.onChangeOfAsset();
  //   }
  // }

  // onChangeOfAsset(){
  //   const asset = this.assets.find((assetObj) => assetObj.asset_id === this.filterObj.asset.asset_id);

  // }
 
  emailBody1Detect(valuefromtextEditor:any,i)
  {
    this.emailbody1 = valuefromtextEditor;
    this.maintenanceModel.maintenance_escalation_registry[i].email_body= this.emailbody1; 
  }
  
  setEditFields()
  {
    this.is_acknowledge_required = this.maintenanceModel.is_acknowledge_required;
    this.is_notify_user = this.maintenanceModel.is_notify_user;
    this.is_escalation_required = this.maintenanceModel.is_escalation_required;
    this.createMaintenanceForm.get('asset_id').setValue(this.maintenanceModel.asset_id);
    this.createMaintenanceForm.get('name').setValue(this.maintenanceModel.name);
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
    this.createMaintenanceForm.get('start_date').setValue(this.maintenanceModel.start_date);
   
    this.inspection_frequency = this.maintenanceModel.inspection_frequency;
    if(this.is_notify_user)
    {
      this.notifyMaintenanceForm.get('notifyBefore').setValue(this.maintenanceModel?.notify_before_hours);
      this.notifyEmails = this.maintenanceModel?.notify_user_emails;
      this.currentItem = this.maintenanceModel.notify_email_body;
      this.notifyMaintenanceForm.get('notify_email_subject').setValue(this.maintenanceModel?.notify_email_subject);
    }
  
    if(this.is_escalation_required)
    {
  
      let maintenance_escalation_registry = [];
      this.maintenanceModel.maintenance_escalation_registry.forEach((element)=>{
      
        maintenance_escalation_registry.push({
          "user_email":element.user_emails,
          "user_groups":element.user_groups,
          "email_body":element.email_body,
          "email_subject":element.email_subject,
          "duration_hours":element.duration_hours
        })
      
      });
      this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    }
  
  }
  
  setViewFields()
  {
    this.is_acknowledge_required = this.maintenanceModel.is_acknowledge_required;
    this.is_notify_user = this.maintenanceModel.is_notify_user;
    this.is_escalation_required = this.maintenanceModel.is_escalation_required;
    this.createMaintenanceForm.get('asset_id').setValue(this.maintenanceModel.asset_id);
    this.createMaintenanceForm.get('name').setValue(this.maintenanceModel.name);
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
    this.createMaintenanceForm.get('start_date').setValue(this.maintenanceModel.start_date);
    if(this.isView)
    {
      this.createMaintenanceForm.get('asset_id').disable();
      this.createMaintenanceForm.get('start_date').disable();
      this.isEdit = false;
    }
    this.inspection_frequency = this.maintenanceModel.inspection_frequency;
    if(this.is_notify_user)
    {
      this.notifyMaintenanceForm.get('notifyBefore').setValue(this.maintenanceModel?.notify_before_hours);
      this.notifyMaintenanceForm.get('notify_email_subject').setValue(this.maintenanceModel?.notify_email_subject);
      this.currentItem = this.maintenanceModel.notify_email_body;
      this.notifyEmails = this.maintenanceModel?.notify_user_emails;
    }
  
    if(this.is_escalation_required)
    {
  
      let maintenance_escalation_registry = [];
      this.maintenanceModel.maintenance_escalation_registry.forEach((element)=>{
        
        maintenance_escalation_registry.push({
          "user_email":element.user_emails,
          "user_groups":element.user_groups,
          "email_body":element.email_body,
          "email_subject":element.email_subject,
          "duration_hours":element.duration_hours
        })
      
      });
      this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    }
  
  }
  
  // this function will call when someone click on icons [Ex. delete, edit, toggle]
  // onTableFunctionCall(obj){
  //   if (obj.for === 'View') {
  //     this.isView = !this.isView;
  //     this.maintenance_registry_id = obj?.data.maintenance_registry_id;
  //     $("#viewMaintainenceModelModal").modal('show');
  //     this.getMaintenance_data(this.maintenance_registry_id);
  //   }
  //   else if (obj.for === 'Delete') {
  //     this.openConfirmDialog("Delete")
  //     this.maintenanceRegistryId = obj?.data.maintenance_registry_id
  //     // this.maintenanceService.deleteMaintenance(obj?.data.maintenance_registry_id).subscribe((response)=>{
  //     //   console.log("del response", response)
  //     //   this.getMaintenance();
  //     // })

  //   }
  //   else if (obj.for === 'Disable') {

  //     console.log("disable",obj)
  //     this.maintenanceRegistryId = obj?.data?.maintenance_registry_id
  //     this.isMaintenanceRequired = obj?.data?.is_maintenance_required
  //     if(!(this.isMaintenanceRequired)){
  //       $("#exampleModal").modal('show');
  //     }
  //     else{
  //       this.payload = {
  //         is_maintenance_required : ! this.isMaintenanceRequired,

  //       }
  //       this.maintenanceService.enableDisable(this.maintenanceRegistryId).subscribe((response)=>{
  //         console.log("disable",response)
  //         this.getMaintenance();
  //        this.toasterService.showSuccess('maintenance disabled successfully !','Maintenance Edit')
  //      })
  //     }

  //     // this.payload = {
  //     //   is_maintenance_required : !obj.data.is_maintenance_required,
  //     //   start_date : "2022-05-30 13:00"
  //     // }
  //   }
  //   else if (obj.for === 'Edit') {
  //     this.onCloseMaintenanceModelModal();
  //     this.isEdit = true;
  //     this.title = "Edit";
  //     this.maintenance_registry_id = obj?.data.maintenance_registry_id;
  //     this.getMaintenance_data(this.maintenance_registry_id);
  //     setTimeout(() => {
  //       this.setEditFields();
  //      }, 1000);
  //     $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
  //   }else if (obj.for === 'Un Provision'){
  //   }
  // }
  onEditSave() { }
  // showing and hiding modal
  // onModalEvents(eventType) {
  //   if(eventType === 'save'){
  //   //  this.maintenanceService.disable(this.maintenanceRegistryId,this.payload).subscribe((response)=>{
  //   //     console.log("enable/disable",response)
  //   //  })
  //   this.maintenanceService.deleteMaintenance(this.maintenanceRegistryId).subscribe((response:any)=>{
  //     console.log("del response", response)
  //     this.getMaintenance();
  //     this.toasterService.showSuccess('maintenance deleted successfully !','Maintenance Delete')
  //   })
  //    $("#confirmMessageModal").modal('hide');
  //   }
  //   else{
  //     $('#confirmMessageModal').modal('hide');
  //   }
  // }

  // openConfirmDialog(type) {
  //   this.modalConfig = {
  //     isDisplaySave: true,
  //     isDisplayCancel: true,
  //     saveBtnText: 'Yes',
  //     cancelBtnText: 'No',
  //     stringDisplay: true,
  //   };
  //   if (type === 'Enable') {
  //     this.confirmBodyMessage = 'Are you sure you want to enable this maintenance?';
  //     this.confirmHeaderMessage = 'Enable ' + 'Maintenance';
  //   }else if(type=== 'Delete'){
  //     this.confirmBodyMessage = 'Are you sure you want to delete this maintenance?';
  //     this.confirmHeaderMessage = 'Delete ' + 'Maintenance';
  //   }
  //   else if (type === 'Disable') {
  //     this.confirmBodyMessage =
  //       'This ' +
  //      'Maintenance' +
  //       ' will be temporarily disabled. Are you sure you want to continue?';
  //     this.confirmHeaderMessage = 'Disable ' +  'Maintenance';
  //   } else if (type === 'Deprovision') {
  //     this.confirmHeaderMessage = 'Deprovision ' + 'Maintenance';
  //     // if (this.type !== CONSTANTS.NON_IP_ASSET) {
  //     //   this.confirmBodyMessage =
  //     //     'This ' +
  //     //     (this.tabData?.table_key || 'Asset') +
  //     //     ' will be permanently deleted. Instead, you can temporarily disable the ' +
  //     //     (this.tabData?.table_key || 'Asset') +
  //     //     '.' +
  //     //     ' Are you sure you want to continue?';
  //     // } else {
  //     //   this.confirmBodyMessage =
  //     //     'This ' +
  //     //     (this.tabData?.table_key || 'Asset') +
  //     //     ' will be permanently deleted.' +
  //     //     ' Are you sure you want to continue?';
  //     // }
  //   }
  //   $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  // }

  // onSave(){
  //   console.log("date&Time",this.maintenanceForm.value.dateAndTime)
  //   this.payload = {
  //     is_maintenance_required : ! this.isMaintenanceRequired,
  //     start_date : this.maintenanceForm.value.dateAndTime
  //   }
  //    this.maintenanceService.enableDisable(this.maintenanceRegistryId).subscribe((response)=>{
  //       console.log("enable",response)
  //       this.maintenanceForm.reset();
  //       this.toasterService.showSuccess('maintenance enable successfully !','Maintenance Edit')
  //       this.getMaintenance();
  //    },(error:any)=>{
  //        console.log("enable error",error)
  //        this.toasterService.showError(`${error.message}`,'Maintenance edit')
  //    })
  //   $("#exampleModal").modal('hide');
  //   this.maintenanceForm.reset();
  // }




























  /////// To open the Modal for the Maintenance Schedule
  openMaintenanceCreateModal() {

  }

  /////  To Clear the Hierarchy from dropdown menu 
 

  /////  While Click on the Save Hierarchy 
 



  // this function will call when someone click on icons [Ex. delete, edit, toggle]
  onTableFunctionCall(obj) {

    if (obj.for === 'View') {
      this.isView = true;
      this.isAsset = false;
      this.title = "View";
      this.maintenance_registry_id = obj?.data.maintenance_registry_id;
      this.getMaintenance_data(this.maintenance_registry_id);
      setTimeout(() => {
        this.setViewFields();
      }, 1000);
      $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
    else if (obj.for === 'Delete') {

      this.openConfirmDialog("Delete")
      this.maintenanceRegistryId = obj?.data.maintenance_registry_id

    }
    else if (obj.for === 'viewAcknowledge') {
      console.log("viewAcknowledge", obj)
      this.showViewAckModal = true
      $("#viewAcknowledge").modal('show')
      this.getAckMaintenance(obj?.data?.maintenance_notification_id);
    }
    else if (obj.for === 'Trigger') {

      this.maintenanceData = []
      $(".over-lap").css('display', 'block')
      this.setMaintenanceConfig();
      this.historyOfPerticularMaintenance(obj);

    }
    else if (obj.for === 'Acknowledge') {
      this.showAckModal = true
      this.maintenanceNotificationId = obj?.data?.maintenance_notification_id
      console.log("on ACkbtn click", obj)
      console.log("acknowledgeID", obj.data.maintenance_notification_id)
      $('#addWhieListAsset').modal('show')
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
    else if (obj.for === 'Edit') {
      this.isEdit = true;
      this.isView = false;
      this.isAsset = true;
      this.title = "Edit";
      this.createMaintenanceForm.get('asset_id').enable()
      this.createMaintenanceForm.get('start_date').enable();
      this.maintenance_registry_id = obj?.data.maintenance_registry_id;
      this.getMaintenance_data(this.maintenance_registry_id);
      setTimeout(() => {
        this.setEditFields();
      }, 1000);
      $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
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
  setMaintenanceConfig() {
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
              icon: 'fa fa-fw fa-eye',
              text: '',
              id: 'viewAcknowledge',
              valueclass: '',
              tooltip: 'viewAcknowledge',
              show_hide_data_key: 'is_acknowledged'
            },
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
  historyOfPerticularMaintenance(obj) {
    this.maintenanceService.Trigger(obj?.data?.maintenance_registry_id).subscribe((res: any) => {
      console.log("ApI Trigger response", res)
      res.data.forEach((item) => {
        item.trigger_date = this.commonService.convertUTCDateToLocalDate(item.trigger_date, "MMM dd, yyyy, HH:mm:ss aaaaa'm'")
      })
      this.maintenanceData = res.data;
    }, (error) => {
      console.log("error while triggering", error)
      this.toasterService.showError(`${error.message}`, 'Error')
    })
    console.log("historyofperticularMaintenance", obj)
    this.asset_id = obj?.data?.asset_id
    this.maintenanceRegistryId = obj?.data?.maintenance_registry_id

  }

  //disable maintenance
  disableMaintenance(maintenanceRegisterId: any, payload: any) {
    this.maintenanceService.disable(maintenanceRegisterId, payload).subscribe((response) => {
      console.log("disable", response)
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance disabled successfully !', 'Maintenance Edit')
    })
  }

  //enable maintenance
  enableMaintenance(maintenanceRegisterId: any, payload: any) {
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
  deleteMaintenance() {
    this.maintenanceService.deleteMaintenance(this.maintenanceRegistryId).subscribe((response: any) => {
      console.log("del response", response)
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance deleted successfully !', 'Maintenance Delete')
    })
  }

  //getting details of acknowledge maintenance
  getAckMaintenance(notificationId: number) {
    this.maintenanceService.getMaintenanceAckDetails(notificationId).subscribe((res: any) => {
      console.log("ackMaintenanceDetails", res)
      res.data.forEach((data) => {
        data.acknowledgement_date = this.commonService.convertUTCDateToLocalDate(data.acknowledgement_date, "MMM dd, yyyy, HH:mm:ss aaaaa'm'")
      })
      this.viewAckMaintenanceDetails = res.data
    })
  }

  searchAssets(updateFilterObj = true) {
  }

  //redirect you to maintenance list screen
  backToMain() {
    $(".over-lap").css('display', 'none')
  }

  closeModal(value: boolean) {
    this.showAckModal = value;
    $("#addWhieListAsset").modal('hide');

  }


}
