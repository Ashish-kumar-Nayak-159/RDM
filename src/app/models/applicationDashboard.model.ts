export class ApplicationDashboardSnapshot {
  device_count: number;
  enabled_device_count: number;
  disabled_device_count: number;
  connected_device_count: number;
  disconnected_device_count: number;
}


export class Alert {
  application_properties: any;
  correlation_id: string;
  created_date: string;
  device_id: string;
  message: any;
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
  device_id: string;
  message: any;
  message_id: string;
  message_date: string;
  system_properties: any;
  time_diff: string;
  type: string;
}

export class Event {
  created_date: string;
  device_id: string;
  event_type: string;
  time_diff: string;
  category: string;
  message_date: string;
  display_name: string;
}
