export class Rule {
    rule_id?: any;
    name: string;
    code: string;
    escalation_time_in_sec: any;
    description: string;
    alert_condition_id: any;
    // alert_condition_code: string = 'model';
    operator: string;
    properties: Array<Properties>;
    conditions: Array<Conditions>;
    condition_str: string = '';
    aggregation_enabled: boolean;
    aggregation_window_in_sec: any;
    updated_by: string;
    created_by: string;
    rules_type?: boolean;
    rule_code?: any;
    metadata?: any;
    condition?: any;
    type?: string;
    actions?: any;
    category_type?:boolean;
    rule_category?:any;
    rule_type?:any;
    constructor() {
        this.properties = [];
        this.conditions = [];
        this.metadata = {};
    }
}

export class Properties {
    property: string;
    type: string;
}

export class Conditions {
    property: string;
    operator: string;
    threshold: any;
    aggregation_type: string;    
}

export class AlertCondition {
    recommendations?: any[];
    visualization_widgets?: any[];
    reference_documents?: any[];
    actions?: any;

    email: boolean;
    sms: boolean;
    whatsapp: boolean;
}
