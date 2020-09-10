export class DeviceListFilter {
  name: string;
  device_manager: string;
  app: string;
  connection_state: string;
  location: string;
  status: string;

  category: string;
}

export class Device {
  device_id: string;
  device_manager: string;
  status: string;
  connection_state: string;
  gateway_id?: string;
  category?: string;
  tags: any;
}
