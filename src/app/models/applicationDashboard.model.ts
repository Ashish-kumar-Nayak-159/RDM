export class ApplicationDashboardSnapshot {
  asset_count: number;
  enabled_asset_count: number;
  disabled_asset_count: number;
  connected_asset_count: number;
  disconnected_asset_count: number;
}


export class Alert {
  application_properties: any;
  correlation_id: string;
  created_date: string;
  asset_id: string;
  message: any;
  asset_display_name?: string;
  message_date: string;
  message_id: string;
  system_properties: any;
  time_diff: string;
  type: string;
}


export class Notification {
  application_properties: any;
  correlation_id: string;
  created_date: string;
  asset_id: string;
  asset_display_name?: string;
  message: any;
  message_id: string;
  message_date: string;
  system_properties: any;
  time_diff: string;
  type: string;
}

export class Event {
  created_date: string;
  asset_id: string;
  event_type: string;
  time_diff: string;
  category: string;
  message_date: string;
  display_name: string;
}
