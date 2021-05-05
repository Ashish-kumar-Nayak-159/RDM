export class DeviceListFilter {
  name: string;
  device_manager: string;
  app: string;
  connection_state: string;
  location: string;
  status: string;
  gateway_id?: string;
  type: string;
  hierarchy: any;
  hierarchyString: string;
  gatewayArr: any[];
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
  metadata: any;
  configuration: any;
  type: string;
}
