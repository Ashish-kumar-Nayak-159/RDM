export class DeviceListFilter {
  name: string;
  device_manager: string;
  app: string;
  connection_state: string;
  location: string;
  status: string;
  gateway_id?: string;
  category: string;
  hierarchy: any;
  hierarchyString: string;
}

export class Device {
  device_id: string;
  device_manager: string;
  status: string;
  connection_state: string;
  gateway_id?: string;
  device_type: string;
  category?: string;
  display_name: string;
  hierarchy: string;
  hierarchyString: string;
  tags: any;
  app: string;
}
