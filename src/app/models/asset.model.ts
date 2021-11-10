export class AssetListFilter {
  name: string;
  asset_manager: string;
  app: string;
  connection_state: string;
  location: string;
  status: string;
  gateway_id?: string;
  type: string;
  hierarchy: any;
  hierarchyString: string;
  asset_model: string;
  gatewayArr: any[];
}

export class Asset {
  asset_id: string;
  asset_manager: string;
  status: string;
  connection_state: string;
  gateway_id?: string;
  asset_model: string;
  category?: string;
  display_name: string;
  hierarchy: string;
  hierarchyString: string;
  tags: any;
  app: string;
  metadata: any;
  configuration: any;
  type: string;
  local_type?: string;
}
