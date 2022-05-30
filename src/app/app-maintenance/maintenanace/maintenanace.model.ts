
export class Maintenanace {

  asset_id:any;
  is_maintenance_required: true;
  name :any;
  htmlEmailContent?:any;
  description?:any;
  start_date :any;
  inspection_frequency :any;
  is_notify_user?:any;
  notify_before_hours? :any;
  notify_user_emails ?: any[]= [];
  notify_email_subject? :any;
  notify_email_body? :any;
  notify_user_groups?:any;
  is_acknowledge_required :any;
  is_escalation_required :any;
  maintenance_escalation_registry? : Array <Escalation>;
  email_body ?: any;
 }
 export class Escalation {
    user_emails: string;
    duration_hours: any;
    user_groups:any;
    email_subject:string;
    email_body:any;
}

