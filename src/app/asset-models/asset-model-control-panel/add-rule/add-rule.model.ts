export class Rule {
    rule_id?: any;
    name: string;
    escalation_time_in_sec: any;
    description: string;
    alert_condition_id: any;
    alert_condition_code: string = 'model';
    operator: string;
    properties: Array<Properties>;
    conditions: Array<Conditions>;
    condition_str: string = '';
    aggregation_enabled: boolean;
    aggregation_window_in_sec: any;
    updated_by: string;
    created_by: string;
    rule_type?: boolean;
    type?: string;

    constructor() {
        this.properties = [];
        this.conditions = [];
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
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
}
