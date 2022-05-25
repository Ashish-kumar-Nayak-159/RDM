export class Maintenanace {

    asset_id:any;
    is_maintenance_required: true;
    name :any;
    htmlEmailContent?:any;
    description?:any;
    start_date :any;
    inspection_frequency :any;
    is_notify_user? = false;
    notify_before_hours? :any;
    notify_user_emails? :any;
    notify_email_subject? :any;
    notify_email_body? :any;
    is_acknowledge_required = false;
    is_escalation_required = false;
    maintenance_escalation_registry? : any [] = [];
    email_body ?: any;
    maintenance_registry_id?:any;
  
   }
  