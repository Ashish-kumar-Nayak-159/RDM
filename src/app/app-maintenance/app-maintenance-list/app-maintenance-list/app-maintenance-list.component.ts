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
import { DateAxis } from '@amcharts/amcharts4/charts';

declare var $: any;


@Component({
  selector: 'app-app-maintenance-list',
  templateUrl: './app-maintenance-list.component.html',
  styleUrls: ['./app-maintenance-list.component.css']
})

export class AppMaintenanceListComponent implements OnInit {
  userGroupArray: any[] = [];
  userGroups: any[] = [];
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
    asset_ids: '',
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
  notifyMaintenanceForm: FormGroup;
  createMaintenanceForm: FormGroup;
  escalMaintenanceForm: FormGroup;
  maintenanceFormEdit: FormGroup;
  description: any;
  maintenance_Sdate: any;
  is_notify_user = false;
  inspection_frequency: any;
  notifyBefore: any;
  notify_user_emails?: any;
  notify_email_subject: any;
  notify_email_body: any;
  is_acknowledge_required = false;

  apiSubscriptions: Subscription[] = [];
  tableConfig: any;
  maintenanceConfig: any;
  maintenances: any = [];
  maintenanceData: any = [];
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
  asset_id: string = ''
  maintenanceNotificationId: number;
  currentOffset = 0;
  currentLimit = 20;
  singleOffset = 0;
  singleLimit = 20;
  registryName: string;
  loader: boolean = false;
  hierarchy: any;
  loadMoreVisibility: boolean = true;
  singleLoadMoreVisibility: boolean = true;
  showHierarchy: boolean = true;
  triggerData: any;
  escalationDetails: any;
  defaultDate:any;

  constructor(
    private commonService: CommonService,
    private assetService: AssetService,
    private maintenanceService: MaintenanceService,
    private toasterService: ToasterService,
    private router: Router
  ) {

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
    this.selectedAsset_id = asset.asset_id
  }

  async ngOnInit(): Promise<void> {

    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.decodedToken = this.commonService.decodeJWTToken(this.commonService.getToken());
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.hierarchy = { App: this.contextApp.app }
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
      maintenance_escalation_registry: [],
      email_body: ''

    };
    this.getTileName();
    this.getMaitenanceModel();
    this.getUserGroup();

    this.getAssets(this.contextApp.user.hierarchy);
    this.getgateway(this.contextApp.user.hierarchy);
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
         //     show_hide_data_key  :(decodedToken?.privileges && decodedToken.privileges.indexOf('MNTCU ') > -1) 
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
    this.getMaintenance();

  }
  addNewEsacalation(i) {
    if(i===0)
    {
      this.is_escalation_required = !this.is_escalation_required;
      this.maintenanceModel.maintenance_escalation_registry = [];
      let maintenance_regirstry = {
        user_emails: '',
        user_email:[],
        duration_hours: 2,
        user_groups: [],
        email_subject: "",
        email_body: "",
        duration_select:"Hours"
      }
      this.maintenanceModel.maintenance_escalation_registry.push(maintenance_regirstry);
    }
   else{
    if(this.maintenanceModel.maintenance_escalation_registry?.length<3)
    {
      let maintenance_regirstry = {
        user_emails: '',
        user_email:[],
        duration_hours: 2,
        user_groups: [],
        email_subject: "",
        email_body: "",
        duration_select:"Hours"
      }
      this.maintenanceModel.maintenance_escalation_registry.push(maintenance_regirstry);
   } 
  }
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

    const custObj = {
      asset_id: this.selectedAsset_id,
      offset: this.currentOffset,
      count: this.currentLimit,
      hierarchy: JSON.stringify(this.hierarchy)
    }

    this.tableConfig.is_table_data_loading = true
    this.maintenanceService.getMaintenance(custObj).subscribe((response: any) => {
      response.data.forEach((item) => {
        item.inspection_frequency = this.itemArray.find((data) => {
          return data.id == item.inspection_frequency
        }).name
        item.start_date = this.commonService.convertUTCDateToLocalDate(item.start_date, "MMM dd, yyyy, HH:mm:ss")
      })
      this.tableConfig.is_table_data_loading = false;
      if (response.data.length < this.currentLimit) {
        this.loadMoreVisibility = false;
      }
      this.maintenances = [...this.maintenances, ...response.data]
    }, (err) => {
      this.tableConfig.is_table_data_loading = false;
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
 
  checkHours()
  {
    if(this.notifyMaintenanceForm.get('hoursOrdays').value=='Days')
    {
      if(this.notifyMaintenanceForm.get('notifyBefore').value > 6 || this.notifyMaintenanceForm.get('notifyBefore').value<2)
      {
        this.toasterService.showError('Notify Before for days should not be more than 6 days or less than 2', 'Notify Before');
        return;
      }
    }
    else
    {
      if(this.notifyMaintenanceForm.get('notifyBefore').value > 23 || this.notifyMaintenanceForm.get('notifyBefore').value <2)
      {
        this.toasterService.showError('Notify Before for hours should not be more than 23 or less than 2', 'Notify Before');
        return;
      }
    }

  }
  esccheckHours(i)
  {
    
    if(this.maintenanceModel.maintenance_escalation_registry[i].duration_select==='Days')
    {
      if(this.maintenanceModel.maintenance_escalation_registry[i].duration_hours!==null && (
        this.maintenanceModel.maintenance_escalation_registry[i].duration_hours > 6 || this.maintenanceModel.maintenance_escalation_registry[i].duration_hours<2))
      {
        this.toasterService.showError('Escalation for days should not be more than 6 days or less than 2', 'Duration Hours');
        return;
      }
    }
    else
    {
      if(this.maintenanceModel.maintenance_escalation_registry[i].duration_hours!==null && 
        (this.maintenanceModel.maintenance_escalation_registry[i].duration_hours > 23 || this.maintenanceModel.maintenance_escalation_registry[i].duration_hours <2))
      {
        this.toasterService.showError('Escalation for hours should not be more than 23 or less than 2', 'Duration Hours');
        return;
      }
    }

  }
getgateway(hierarchy)
{
 
  const obj = {
    hierarchy: JSON.stringify(hierarchy),
    type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET + ',' + CONSTANTS.IP_GATEWAY + ","
  };
 
  this.assetService.getAndSetAllAssets(obj,this.contextApp.app).subscribe((response: any) => {
    if (response?.data) {
      for (var i = 0; i < response?.data.length; i++) {
       
        this.assetDropdown.push( {
          asset_name: response?.data[i].display_name,
          asset_ids: response?.data[i].asset_id,
          asset_type: response?.data[i].type
        });
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
            for (var i = 0; i < this.assets.length; i++) {
              this.assetsdata = {
                asset_name: this.assets[i].display_name,
                asset_ids: this.assets[i].asset_id,
                asset_type: this.assets[i].type
              };
              this.assetDropdown.push(this.assetsdata);
            }
            if (this.assets?.length === 1) {
              this.filterObj.asset = this.assets[0];
              this.onChangeOfAsset();
            }
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

  getMaitenanceModel() {
    this.createMaintenanceForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.pattern(CONSTANTS.ONLY_NOS_AND_CHARS)]),
      asset_ids: new FormControl('', [Validators.required]),
      start_date: new FormControl('', [Validators.required]),
      inspection_frequency: new FormControl('', [Validators.required]),
      description: new FormControl('')
    })

    this.notifyMaintenanceForm = new FormGroup({
      notifyBefore: new FormControl(2, [Validators.required]),
      notify_user_emails: new FormControl('', [Validators.required]),
      notify_email_subject: new FormControl('', [Validators.required]),
      notify_user_groups: new FormControl('') ,
      hoursOrdays:new FormControl('')
    })


  }

  emailBodyDetect(valuefromtextEditor: any) {
    this.htmlContent = valuefromtextEditor;
  }


  onSaveMaintenanceModelModal() {
      this.createMaitenanceCall = true;
    if((this.createMaintenanceForm.get("name").value===undefined || this.createMaintenanceForm.get("name").value==='')
     || (this.createMaintenanceForm.get("asset_ids").value===undefined || this.createMaintenanceForm.get("name").value==='')
     || (this.createMaintenanceForm.get("start_date").value===undefined || this.createMaintenanceForm.get("start_date").value==='') 
     || (this.createMaintenanceForm.get("inspection_frequency").value===undefined || this.createMaintenanceForm.get("inspection_frequency").value==='')
     || (this.createMaintenanceForm.get("name").errors!==null && this.createMaintenanceForm.get("name").errors.required!==undefined && this.createMaintenanceForm.get("name").errors.required) 
     || (this.createMaintenanceForm.get("asset_ids").errors!==null && this.createMaintenanceForm.get("asset_ids").errors.required!==undefined && this.createMaintenanceForm.get("inspection_frequency").errors.required)
     || (this.createMaintenanceForm.get("inspection_frequency").errors!==null && this.createMaintenanceForm.get("inspection_frequency").errors.required!==undefined && this.createMaintenanceForm.get("asset_ids").errors.required) 
     || (this.createMaintenanceForm.get("start_date").errors!==null && this.createMaintenanceForm.get("start_date").errors.required!==undefined && this.createMaintenanceForm.get("start_date").errors.required)
     ) {
     
        this.toasterService.showError('Please Enter mandatory information'," Maitenance Create");
        this.createMaitenanceCall = false;
        return;
    }
    else if(this.maintenanceModel.maintenance_escalation_registry?.length>0  && this.is_escalation_required)
    {
      for(var n=0;n<this.maintenanceModel.maintenance_escalation_registry?.length;n++)
      {
         if(this.maintenanceModel.maintenance_escalation_registry[n]?.user_email===undefined || 
          this.maintenanceModel.maintenance_escalation_registry[n]?.duration_hours===undefined || this.maintenanceModel.maintenance_escalation_registry[n]?.duration_hours==='' 
          || this.maintenanceModel.maintenance_escalation_registry[n]?.email_subject===undefined || this.maintenanceModel.maintenance_escalation_registry[n]?.email_subject==='' 
          || this.maintenanceModel.maintenance_escalation_registry[n]?.email_body===undefined || this.maintenanceModel.maintenance_escalation_registry[n]?.email_body==='' 
          || this.maintenanceModel.maintenance_escalation_registry[n]?.user_groups===undefined || this.maintenanceModel.maintenance_escalation_registry[n]?.user_groups==='' 
          || (this.maintenanceModel.maintenance_escalation_registry[n]?.user_email.length===0 && this.maintenanceModel.maintenance_escalation_registry[n]?.user_groups.length===0))
          {
          this.createMaitenanceCall = false;
          this.toasterService.showError('Please Enter mandatory information for escalation '+(n+1)," Maitenance Create");
          return;
        }
      }
    
      for(var n=0;n<this.maintenanceModel.maintenance_escalation_registry?.length;n++)
      {
       if(this.maintenanceModel.maintenance_escalation_registry[n].duration_select=='Days' && 
        (this.maintenanceModel.maintenance_escalation_registry[n].duration_hours!==null && (this.maintenanceModel.maintenance_escalation_registry[n].duration_hours > 6 || this.maintenanceModel.maintenance_escalation_registry[n].duration_hours<2)))
        {
            this.toasterService.showError('Escalation for days should not be more than 6 days or less than 2', 'Escalation');
            this.createMaitenanceCall = false;
            return;
        }
      }
      for(var n=0;n<this.maintenanceModel.maintenance_escalation_registry?.length;n++)
      {
      if(this.maintenanceModel.maintenance_escalation_registry[n].duration_select=='Hours' &&
        this.maintenanceModel.maintenance_escalation_registry[n].duration_hours!==null &&
        (this.maintenanceModel.maintenance_escalation_registry[n].duration_hours > 23 ||
          this.maintenanceModel.maintenance_escalation_registry[n].duration_hours <2))
          {
            this.toasterService.showError('Escalation for hours should not be more than 23 or less than 2', 'Escalation');
            this.createMaitenanceCall = false;
            return;
          }
      }
    }
   else if(this.is_notify_user && (this.htmlContent==null || this.htmlContent==undefined))
      {
        this.createMaitenanceCall = false;
        this.toasterService.showError('Please Enter mandatory information for Notify user'," Maitenance Create");
        return;
      }   
    else if(this.notifyMaintenanceForm.get('hoursOrdays').value=='Days' && (this.notifyMaintenanceForm.get('notifyBefore').value > 6 || this.notifyMaintenanceForm.get('notifyBefore').value<2))
    {
        this.toasterService.showError('Notify Before for days should not be more than 6 days or less than 2', 'Notify Before');
        this.createMaitenanceCall = false;
        return;
    }
    else if(this.notifyMaintenanceForm.get('hoursOrdays').value=='Hours' && (this.notifyMaintenanceForm.get('notifyBefore').value > 23 || this.notifyMaintenanceForm.get('notifyBefore').value <2))
      {
        this.toasterService.showError('Notify Before for hours should not be more than 23 or less than 2', 'Notify Before');
        this.createMaitenanceCall = false;
        return;
      }
    else if((new Date(this.createMaintenanceForm.get("start_date").value).getTime())<(new Date().getTime()))
    {
      this.toasterService.showError('Start Date should not be less than todays date', 'Start Date');
      this.createMaitenanceCall = false;
      return;
    }
   
    let maintenance_escalation_registry :any [] = [];
    this.maintenanceModel.maintenance_escalation_registry?.forEach((element,index)=>
    {
      if(this.maintenanceModel.maintenance_escalation_registry[index].duration_select=='Days')
      {
        element.duration_hours = element?.duration_hours * 24;
      }
      maintenance_escalation_registry.push({
        "user_emails": element?.user_email,
        "user_groups": element?.user_groups,
        "email_body": element?.email_body,
        "email_subject": element?.email_subject,
        "duration_hours": element?.duration_hours
      })

    })
    this.maintenanceModel = this.createMaintenanceForm.value;
    this.maintenanceModel.asset_id = this.createMaintenanceForm.get("asset_ids").value;
    this.maintenanceModel.is_maintenance_required = true;
    this.maintenanceModel.is_notify_user = this.is_notify_user;
    this.maintenanceModel.is_escalation_required = this.is_escalation_required;
    this.maintenanceModel.is_acknowledge_required = this.is_acknowledge_required;
    if (this.is_notify_user) {
      if( this.notifyMaintenanceForm.get('hoursOrdays').value==='Days')
      {
        this.maintenanceModel.notify_before_hours = parseInt(this.notifyMaintenanceForm.get('notifyBefore').value)*24;
      }
      else
      {
        this.maintenanceModel.notify_before_hours = this.notifyMaintenanceForm.get('notifyBefore').value;
      }

      this.maintenanceModel.notify_user_emails =  this.notifyEmails;
      this.maintenanceModel.notify_user_groups = this.notifyMaintenanceForm.get('notify_user_groups').value;
      this.maintenanceModel.notify_email_subject = this.notifyMaintenanceForm.get('notify_email_subject').value;
    }
    this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    this.maintenanceModel.notify_email_body = this.htmlContent;
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
    if (this.isEdit) {

      let method = this.maintenanceService.updateNewMaintenanceRule(this.maintenance_registry_id, this.maintenanceModel);
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          this.toasterService.showSuccess(response.message, 'Maitenance Update');
          $('#createMaintainenceModelModal').modal('hide');
          this.isEdit = false;
          this.createMaitenanceCall = false;
          this.redirectTo(this.router.url);
        },
        (err: HttpErrorResponse) => {
          this.createMaitenanceCall = false;
          this.setEditFields();
          this.toasterService.showError(err.message, " Maitenance Update");
        }
      );
    }
    else {
      let method = this.maintenanceService.createNewMaintenanceRule(this.contextApp, "CreateMaintenance", this.maintenanceModel);
      method.subscribe(
        (response: any) => {
          // this.onCloseRuleModel.emit({
          //   status: true,
          // });
          this.toasterService.showSuccess(response.message, 'Maitenance Create');
          $('#createMaintainenceModelModal').modal('hide');
          this.createMaitenanceCall = false;
          this.redirectTo(this.router.url);
        },
        (err: HttpErrorResponse) => {
          this.createMaitenanceCall = false;
          this.toasterService.showError(err.message, " Maitenance Create");
        }
      );
    }
  }

isAsset = false;
 /////// To open the Modal for the Maintenance Schedule
 async openCreateMaintenanceModelModal(obj = undefined) {
   this.title = "Add";
   this.isView = false;
   this.isAsset = true;
   this.notifyEmails = [];
   this.emails = [];
   this.isEdit = false;
   if(this.createMaintenanceForm !== undefined)
   { 
     this.createMaintenanceForm.reset();
     this.createMaintenanceForm.get('asset_ids').enable()
     var today = new Date().toISOString().slice(0, 16)
     this.createMaintenanceForm.get('start_date').setValue(today);
     this.createMaintenanceForm.get('start_date').enable();
   }
   if(this.notifyMaintenanceForm !== undefined)
   { 
     this.notifyMaintenanceForm.reset();
     this.notifyMaintenanceForm.get('notifyBefore').setValue(2);
   }
   if(this.escalMaintenanceForm !== undefined)
   { 
    this.escalMaintenanceForm.reset();
    }
   this.is_notify_user = false;
   this.is_acknowledge_required = false;
   this.is_escalation_required = true;
   this.addNewEsacalation(0);
  $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
  
   }
   emails = [];
   addEmailRecipient(i) {
    
    if (!this.emails) {
      this.toasterService.showError('Email is required', 'Add Email');
    } else {
      if (!CONSTANTS.EMAIL_REGEX.test(this.maintenanceModel.maintenance_escalation_registry[i]?.user_emails)) {
        this.maintenanceModel.maintenance_escalation_registry[i].user_emails = '';
        this.toasterService.showError('Email address is not valid', 'Add Email');
        return;
      }
      if (this.maintenanceModel.maintenance_escalation_registry[i]?.user_email?.includes(this.maintenanceModel.maintenance_escalation_registry[i].user_emails)) {
        this.maintenanceModel.maintenance_escalation_registry[i].user_emails = '';
        this.toasterService.showError('Email address is already added', 'Add Email');
        return;
      }
      this.emails.push(this.maintenanceModel.maintenance_escalation_registry[i].user_emails);
      this.maintenanceModel.maintenance_escalation_registry[i]?.user_email.push(this.maintenanceModel.maintenance_escalation_registry[i]?.user_emails);
      this.maintenanceModel.maintenance_escalation_registry[i].user_emails = '';
    }
  }


  removeEmailRecipient(i, index) {
    this.emails.splice(index, 1);
    this.maintenanceModel.maintenance_escalation_registry[i].user_email.splice(index, 1);
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
      if (this.notifyEmails?.includes(this.notifyMaintenanceForm.get('notify_user_emails').value)) {
        this.notifyMaintenanceForm.get('notify_user_emails').setValue('')
        this.toasterService.showError('Email address is already added', 'Add Email');
        return;
      }
      this.notifyEmails.push(this.notifyMaintenanceForm.get('notify_user_emails').value);
      this.notifyMaintenanceForm.get('notify_user_emails').setValue('')

    }
  }


  removeEmailNotifyRecipient(index) {
    this.notifyEmails.splice(index, 1);
  }


  redirectTo(uri: string) {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate([uri]));
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
      debugger;
        this.maintenanceModel = (response.data);
 
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

  emailBody1Detect(valuefromtextEditor: any, i) {
    this.emailbody1 = valuefromtextEditor;
    this.maintenanceModel.maintenance_escalation_registry[i].email_body = this.emailbody1;
  }
 
  setEditFields()
  {
    this.isView = false;
    this.is_acknowledge_required = this.maintenanceModel.is_acknowledge_required;
    this.is_notify_user = this.maintenanceModel.is_notify_user;
    this.is_escalation_required = this.maintenanceModel.is_escalation_required;
    this.createMaintenanceForm.get('asset_ids').setValue(this.maintenanceModel.asset_id);
    this.createMaintenanceForm.get('name').setValue(this.maintenanceModel.name);
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
    this.createMaintenanceForm.get('start_date').setValue(this.maintenanceModel.start_date);

    this.inspection_frequency = this.maintenanceModel.inspection_frequency;
    if (this.is_notify_user) {
      this.notifyMaintenanceForm.get('notifyBefore').setValue(this.maintenanceModel?.notify_before_hours);
      this.notifyEmails = this.maintenanceModel?.notify_user_emails;
      this.currentItem = this.maintenanceModel?.notify_email_body;
      this.notifyMaintenanceForm.get('hoursOrdays').setValue('Hours');
      this.notifyMaintenanceForm.get('notify_user_groups').setValue(this.maintenanceModel?.notify_user_groups);
      this.notifyMaintenanceForm.get('notify_email_subject').setValue(this.maintenanceModel?.notify_email_subject);
    }
    this.notifyMaintenanceForm.get('hoursOrdays').setValue('Hours');
  
    if (this.is_escalation_required) {

      let maintenance_escalation_registry = [];
      this.maintenanceModel.maintenance_escalation_registry.forEach((element) => {

        maintenance_escalation_registry.push({
          "user_email":element.user_emails,
          "user_groups":element.user_groups,
          "email_body":element.email_body,
          "email_subject":element.email_subject,
          "duration_hours":element.duration_hours,
          "duration_select":'Hours'
        })

      });
      this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    }

  }
  notify_user_groups = '';
  setViewFields() {
    this.is_acknowledge_required = this.maintenanceModel.is_acknowledge_required;
    this.is_notify_user = this.maintenanceModel.is_notify_user;
    this.is_escalation_required = this.maintenanceModel.is_escalation_required;
    this.createMaintenanceForm.get('asset_ids').setValue(this.maintenanceModel.asset_id);
    this.createMaintenanceForm.get('name').setValue(this.maintenanceModel.name);
    this.createMaintenanceForm.get('description').setValue(this.maintenanceModel.description);
    this.createMaintenanceForm.get('start_date').setValue(this.maintenanceModel.start_date);
    if (this.isView) {
      this.createMaintenanceForm.get('asset_ids').disable();
      this.createMaintenanceForm.get('start_date').disable();
      this.isEdit = false;
    }
    this.inspection_frequency = this.maintenanceModel.inspection_frequency;
    if (this.is_notify_user) {
      this.notifyMaintenanceForm.get('notifyBefore').setValue(this.maintenanceModel?.notify_before_hours);
      this.notifyMaintenanceForm.get('notify_email_subject').setValue(this.maintenanceModel?.notify_email_subject);
      this.currentItem = this.maintenanceModel.notify_email_body;
      this.notifyEmails = this.maintenanceModel?.notify_user_emails;
      this.notifyMaintenanceForm.get('notify_user_groups').setValue(this.maintenanceModel?.notify_user_groups);
      this.notify_user_groups = this.maintenanceModel?.notify_user_groups;
    }

    if (this.is_escalation_required) {

      let maintenance_escalation_registry = [];
      this.maintenanceModel.maintenance_escalation_registry.forEach((element) => {

        maintenance_escalation_registry.push({
          "user_email": element.user_emails,
          "user_groups": element.user_groups,
          "email_body": element.email_body,
          "email_subject": element.email_subject,
          "duration_hours": element.duration_hours
        })

      });
      this.maintenanceModel.maintenance_escalation_registry = maintenance_escalation_registry;
    }

  }

  /////// To open the Modal for the Maintenance Schedule
  openMaintenanceCreateModal() {

  }

  // this function will call when someone click on icons [Ex. delete, edit, toggle]
  onTableFunctionCall(obj) {

    if (obj.for === 'View') {
      this.isView = true;
      this.isAsset = false;
      this.createMaitenanceCall = true;
      this.title = "View";
      this.maintenance_registry_id = obj?.data.maintenance_registry_id;
      this.getMaintenance_data(this.maintenance_registry_id);
      setTimeout(() => {
        this.setViewFields();
        this.createMaitenanceCall = false;
      }, 500);
      $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
    else if (obj.for === 'Delete') {

      this.openConfirmDialog("Delete")
      this.maintenanceRegistryId = obj?.data.maintenance_registry_id

    }
    else if (obj.for === 'viewAcknowledge') {
      $("#viewAcknowledge").modal('show')
      this.getAckMaintenance(obj?.data?.maintenance_notification_id);
    }
    else if (obj.for === 'Escalation') {
      obj?.data?.maintenance_escalations.forEach((data) => {
        data.trigger_date = this.commonService.convertUTCDateToLocalDate(data.trigger_date, "MMM dd, yyyy, HH:mm:ss")
      })
      this.escalationDetails = obj?.data?.maintenance_escalations
      $("#escalation").modal('show')

    }
    else if (obj.for === 'Trigger') {
      this.showHierarchy = false;
      this.maintenanceData = []
      $(".over-lap").css('display', 'block')
      this.setMaintenanceConfig();
      this.triggerData = obj
      this.registryName = this.triggerData?.data?.name
      this.asset_id = this.triggerData?.data?.asset_id
      this.maintenanceRegistryId = this.triggerData?.data?.maintenance_registry_id
      this.historyOfPerticularMaintenance();

    }
    else if (obj.for === 'Acknowledge') {
      this.maintenanceNotificationId = obj?.data?.maintenance_notification_id
      $('#maintenanceModal').modal('show')
    }
    else if (obj.for === 'Disable') {
      this.maintenanceRegistryId = obj?.data?.maintenance_registry_id
      this.isMaintenanceRequired = obj?.data?.is_maintenance_required
      if (!(this.isMaintenanceRequired)) {
        $("#exampleModal").modal('show');    
        this.maintenanceForm.get('dateAndTime').setValue(new Date(obj?.data?.start_date).toISOString().slice(0,16) )     
      }
      else {
        this.payload = {
          is_maintenance_required: !this.isMaintenanceRequired,
        }
        this.enableDisableMaintenance(this.maintenanceRegistryId, this.payload)
      }
    }
    else if (obj.for === 'Edit') {
      this.isEdit = true;
      this.isView = false;
      this.isAsset = true;
      this.title = "Edit";
      this.addNewEsacalation(1);
      this.createMaitenanceCall = true;
      this.createMaintenanceForm.get('asset_ids').enable()
      this.createMaintenanceForm.get('start_date').enable();
      this.maintenance_registry_id = obj?.data.maintenance_registry_id;
      this.getMaintenance_data(this.maintenance_registry_id);
      setTimeout(() => {
        this.setEditFields();
        this.createMaitenanceCall = false;
      }, 500);
      $('#createMaintainenceModelModal').modal({ backdrop: 'static', keyboard: false, show: true });
    }
    else if (obj.for === 'Clone') {

      this.maintenanceRegistryId = obj?.data?.maintenance_registry_id;
      this.getMaintenance_data(this.maintenance_registry_id);
      setTimeout(() => {
       let method = this.maintenanceService.createNewMaintenanceRule(this.contextApp,"CreateMaintenance",this.maintenanceModel);
        method.subscribe(
          (response: any) => {
            // this.onCloseRuleModel.emit({
            //   status: true,
            // });
            this.toasterService.showSuccess(response.message,   'Maitenance Clone');
            this.redirectTo(this.router.url);
          },
          (err: HttpErrorResponse) => {
            this.createMaitenanceCall = false;
            this.toasterService.showError(err.message," Maitenance Clone");
          }
        );
        
     }, 500); 
       // this.payload = {
       //   is_maintenance_required : !obj.data.is_maintenance_required,
       //   start_date : "2022-05-30 13:00"
       // }
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
    this.payload = {
      is_maintenance_required: !this.isMaintenanceRequired,
      start_date: this.maintenanceForm.value.dateAndTime
    }
    this.enableDisableMaintenance(this.maintenanceRegistryId, this.payload);

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
            {
              icon: 'fa fa-fast-forward',
              text: '',
              id: 'Escalation',
              valueclass: '',
              tooltip: 'Escalation',
              show_hide_data_key: 'is_escalation_required'
            },
          ],
        },
      ],
    };
  }

  // getting data for perticular maintenance when someone click on trigger btn
  historyOfPerticularMaintenance() {
    const custObj = {
      offset: this.singleOffset,
      count: this.singleLimit,
    }
    this.maintenanceConfig.is_table_data_loading = true
    this.maintenanceService.Trigger(this.triggerData?.data?.maintenance_registry_id, custObj).subscribe((res: any) => {
      res?.data?.forEach((item) => {
        item.trigger_date = this.commonService.convertUTCDateToLocalDate(item.trigger_date, "MMM dd, yyyy, HH:mm:ss"),
          item.is_escalation_required = this.triggerData?.data?.is_escalation_required
      })
      this.maintenanceConfig.is_table_data_loading = false;
      if (res.data.length < this.singleLimit) {
        this.singleLoadMoreVisibility = false;
      }
      this.maintenanceData = [...this.maintenanceData, ...res.data];
    }, (error) => {
      this.maintenanceConfig.is_table_data_loading = false;
      this.toasterService.showError(`${error.message}`, 'Error')
    })


  }

  //enable disable maintenance
  enableDisableMaintenance(maintenanceRegisterId: any, payload: any) {
    this.maintenanceService.disableEnable(maintenanceRegisterId, payload).subscribe((response) => {
      this.maintenances = []
      this.currentOffset = 0;
      this.singleOffset = 0;
      this.maintenanceForm.reset();
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance updated successfully !', 'Maintenance Edit')
    }, (error: any) => {
      this.toasterService.showError(`${error.message}`, 'Maintenance edit')
    })
  }

  //delete maintenance
  deleteMaintenance() {
    this.maintenanceService.deleteMaintenance(this.maintenanceRegistryId).subscribe((response: any) => {
      this.maintenances = []
      this.currentOffset = 0;
      this.singleOffset = 0;
      this.getMaintenance();
      this.toasterService.showSuccess('maintenance deleted successfully !', 'Maintenance Delete')
    })
  }

  //getting details of acknowledge maintenance
  getAckMaintenance(notificationId: number) {
    this.maintenanceService.getMaintenanceAckDetails(notificationId).subscribe((res: any) => {
      res.data.forEach((data) => {
        data.acknowledgement_date = this.commonService.convertUTCDateToLocalDate(data.acknowledgement_date, "MMM dd, yyyy, HH:mm:ss")
      })
      this.viewAckMaintenanceDetails = res.data
    })
  }

  //calling hierarchy
  filteredHiearchyObj() {
    this.maintenances = []
    this.currentOffset = 0;
    // const configuredHierarchy = this.hierarchyDropdown.getConfiguredHierarchy();
    // Object.keys(configuredHierarchy).length === 0;
    // this.onClearHierarchy();
    // this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    // if (this.contextApp) {
    //   Object.keys(configuredHierarchy).forEach((key) => {
    //     if (configuredHierarchy[key]) {
    //       this.hierarchy[this.contextApp.hierarchy.levels[key]] = configuredHierarchy[key];
    //     }
    //   });
    // }
    this.getMaintenance();


  }

  onClearHierarchy() {
    this.selectedAsset_id = null;
    this.hierarchy = { App: this.contextApp?.app };
  }


  searchAssets(updateFilterObj = true) {
  }

  //redirect you to maintenance list screen
  backToMain() {
    this.showHierarchy = true;
    $(".over-lap").css('display', 'none')
  }

  closeModal(value: boolean) {
    $("#maintenanceModal").modal('hide');

  }


}
