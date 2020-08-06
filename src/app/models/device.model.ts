export class DeviceListFilter {
  name: string;
  device_manager: string;
  app: string;
  connection_state: string;
  location: string;
  status: string;
}

export class Device {
  device_id: string;
  status: string;
  connection_state: string;
  tags: {
    app_name?: string;
    protocol?: string;
    connectivity?: {
      network?: string;
    };
    device_manager?: string;
    device_type?: string;
    issued_by?: string;
    location?: string;
    custom_tags?: any;
  };
}
