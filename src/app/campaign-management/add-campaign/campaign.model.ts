export class Campaign {
  objective: string;
  asset_model: string;
  asset_model_obj: any;
  job_id: string;
  code?: string;
  request_type: string;
  communication_method: string;
  expected_start_date: number;
  expected_end_date: number;
  expected_start_date_display?: string;
  expected_end_date_display?: string;
  job_request: any;
  objective_name?: string;
  retry_required: boolean;
  hierarchy: any;
  hierarchyString?: string;
}
