export class AppUrls {
  public static GET_APPLICATION_DASHBOARD_SNAPSHOT = 'apps/{0}/asset_statistics';
  public static GET_DEVICE_FILTER_LIST = 'DLM_GetAssets';
  public static GET_DEVICE_DATA = 'apps/{0}/iot_assets/{1}/tags';
  public static UPDATE_DEVICE_TAGS = 'apps/{0}/iot_assets/{1}/tags';
  public static GET_DEVICE_LIFECYCLE_EVENTS = 'DLM_GetAssetLifeCycleEvents';
  public static GET_HEARTBEAT_LIST = 'D2C_GetAssetHeartbeats';
  public static GET_NOTIFICAION_LIST = 'D2C_GetAssetNotifications';
  public static GET_ALERTS_LIST = 'D2C_GetAssetAlerts';
  public static GET_ALERT_END_EVENT_LIST = 'D2C_GetAssetAlertEndEvents';
  public static GET_TELEMETRY_LIST = 'apps/{0}/d2c/telemetry';
  public static GET_DERIVEDKPI_LIST = 'apps/{0}/asset_derived_kpis/{1}';
  public static GET_RULES_LIST = 'apps/{0}/assets/{1}/rules';
  public static GET_ERROR_LIST = 'D2C_GetAssetErrors';
  public static GET_OTHER_MESSAGE_LIST = 'D2C_GetAssetOtherMessages';
  public static GET_DEVICE_BATTERY_LIST = 'D2C_GetAssetBatteryMessages';
  public static GET_C2D_MESSAGE_LIST = 'apps/{0}/c2d/jobs';
  public static GET_QUEUE_MESSAGE_COUNT = 'apps/{0}/c2d/queue_message_count';
  public static PURGE_QUEUE_MESSAGE = 'apps/{0}/c2d/purge_messages';
  public static GET_MESSAGE_REQUEST_DETAILS = 'apps/{0}/c2d/jobs/{1}';
  public static GET_MESSAGE_RESPONSE_DETAILS = 'apps/{0}/c2d/job_responses';
  public static GET_C2D_MESSAGE_JSON = 'apps/{0}/c2d/messages/{1}';
  public static GET_C2D_RESPONSE_JSON = 'D2C_GetAssetResponses';
  public static GET_DEVICE_CREDENTIALS = 'DLM_GetAssetCredentials';
  public static GET_DEVICE_CONNECTION_STATUS = 'DLM_GetAssetConnectionStatus';
  public static ENABLE_DEVICE = 'DLM_EnableAsset';
  public static DISABLE_DEVICE = 'DLM_DisableAsset';
  public static DELETE_DEVICE = 'DLM_DeleteAsset';
  public static CREATE_DEVICE = 'DLM_CreateAsset';
  public static SEND_C2D_MESSAGE = 'apps/{0}/iot_assets/{1}/c2d_messages';
  public static LOGIN = 'login';
  public static GET_APPLICATIONS_LIST = 'apps';
  public static CREATE_APP = 'apps';
  public static UPDATE_APP = 'apps/{0}';
  public static CREATE_USER = 'apps/{0}/users';
  public static UPDATE_USER = 'apps/{0}/users/{1}';
  public static CREATE_NON_IP_DEVICE = 'apps/{0}/legacy_assets';
  public static GET_NON_IP_DEVICE = 'apps/{0}/legacy_assets';
  public static DELETE_NON_IP_DEVICE = 'apps/{0}/legacy_assets/{1}';
  public static UPDATE_NON_IP_DEVICE_TAGS = 'apps/{0}/legacy_assets/{1}/tags';
  public static GE_NON_IP_DEVICES_COUNT = 'apps/{0}/legacy_assets_count';
  public static GET_APP_DETAILS = 'apps/{0}';
  public static GET_APP_USERS = 'apps/{0}/users';
  public static CREATE_LAYOUT = 'layout';
  public static GET_LAYOUT = 'layouts';
  public static GET_THINGS_MODELS = 'apps/{0}/asset_types';
  public static GET_THINGS_MODEL_DETAILS = 'apps/{0}/asset_types/{1}';
  public static CREATE_THINGS_MODEL = 'apps/{0}/asset_types';
  public static UPDATE_THINGS_MODEL = 'apps/{0}/asset_types/{1}';
  public static FREEZE_THINGS_MODEL = 'apps/{0}/asset_types/{1}/freeze';
  public static UNFREEZE_THINGS_MODEL = 'apps/{0}/asset_types/{1}/unfreeze';
  public static GET_THINGS_MODEL_PROPERTIES = 'apps/{0}/asset_types/{1}/properties';
  public static GET_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/asset_types/{1}/control_widgets';
  public static CREATE_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/asset_types/{1}/control_widget';
  public static UPDATE_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/asset_types/{1}/control_widget/{2}';
  public static GET_THINGS_MODEL_CONFIGURATION_WIDGETS = 'apps/{0}/asset_types/{1}/configuration_widgets';
  public static CREATE_THINGS_MODEL_CONFIGURATION_WIDGETS = 'apps/{0}/asset_types/{1}/configuration_widget';
  public static UPDATE_THINGS_MODEL_CONFIGURATION_WIDGETS = 'apps/{0}/asset_types/{1}/configuration_widget/{2}';
  public static GET_THINGS_MODEL_DEVICE_METHODS = 'apps/{0}/asset_types/{1}/asset_methods';
  public static GET_THINGS_MODEL_LAYOUT = 'apps/{0}/asset_types/{1}/historical_widgets';
  public static ACKNOWLEGE_DEVICE_ALERT = 'D2C_UpdateAlertMetadata';
  public static DELETE_CONTROL_WIDGET = 'apps/{0}/asset_types/{1}/control_widget/{2}';
  public static DELETE_CONFIGURATION_WIDGET = 'apps/{0}/asset_types/{1}/configuration_widget/{2}';
  public static UPDATE_APP_HIERARCHY = 'apps/{0}/hierarchy';
  public static UPDATE_APP_ROLES = 'apps/{0}/roles';
  public static RESET_PASSWORD = 'users/reset_password';
  public static GET_ALERT_MESSAGE_BY_ID = 'D2C_GetAssetAlertMessage';
  public static GET_ALERT_END_EVENT_MESSAGE_BY_ID = 'D2C_GetAssetAlertEndEventMessage';
  public static GET_TELEMETRY_MESSAGE_BY_ID = 'apps/{0}/d2c/telemetry/{1}';
  public static GET_BATTERY_MESSAGE_BY_ID = 'D2C_GetAssetBatteryMessage';
  public static GET_HEARTBEAT_MESSAGE_BY_ID = 'D2C_GetAssetHeartbeat';
  public static GET_LOG_MESSAGE_BY_ID = 'D2C_GetAssetLog';
  public static GET_NOTIFICATION_MESSAGE_BY_ID = 'D2C_GetAssetNotification';
  public static GET_OTHER_MESSAGE_BY_ID = 'D2C_GetAssetOtherMessage';
  public static GET_ERROR_MESSAGE_BY_ID = 'D2C_GetAssetErrorMessage';
  public static GET_NON_IP_DEVICE_TAGS = 'apps/{0}/legacy_assets/{1}/tags';
  public static GET_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/asset_types/{1}/reference_documents';
  public static CREATE_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/asset_types/{1}/reference_documents';
  public static UPDATE_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/asset_types/{1}/reference_documents/{2}';
  public static DELETE_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/asset_types/{1}/reference_documents/{2}';
  public static GET_MODEL_ACKNOWLEDGEMENT_REASONS = 'apps/{0}/asset_models/{1}/alert_acknowledge_reasons';
  public static CREATE_MODEL_ACKNOWLEDGEMENT_REASONS = 'apps/{0}/asset_models/{1}/alert_acknowledge_reasons';
  public static UPDATE_MODEL_ACKNOWLEDGEMENT_REASONS = 'apps/{0}/asset_models/{1}/alert_acknowledge_reasons/{2}';
  public static DELETE_MODEL_ACKNOWLEDGEMENT_REASONS = 'apps/{0}/asset_models/{1}/alert_acknowledge_reasons/{2}';
  public static GET_ALERT_CONDITIONS = 'apps/{0}/asset_types/{1}/alert_conditions';
  public static CREATE_ALERT_CONDITION = 'apps/{0}/asset_types/{1}/alert_conditions';
  public static UPDATE_ALERT_CONDITION = 'apps/{0}/asset_types/{1}/alert_conditions/{2}';
  public static DELETE_ALERT_CONDITION = 'apps/{0}/asset_types/{1}/alert_conditions/{2}';
  public static GET_IOT_LEGACY_DEVICES = 'apps/{0}/assets';
  public static GET_REPORT_TELEMETRY_DATA = 'apps/{0}/d2c/telemetry_report';
  public static SIGNALR_NEGOTIATE = 'signalr/negotiate';
  public static GET_MODEL_ALERT_REASONS = 'apps/{0}/asset_models/{1}/alert_acknowledge_reasons';
  public static GET_SAMPLING_DEVICE_TELEMETRY = 'apps/{0}/d2c/telemetry_sampling';
  public static GET_DEVICE_SIGNALR_MODE = 'apps/{0}/assets/{1}/get_telemetry_mode';
  // public static CHANGE_TELEMETRY_MODE = 'apps/{0}/c2d/change_telemetry_mode';
  public static CHANGE_TELEMETRY_MODE = 'apps/{0}/c2d/change_telemetry_mode_using_direct_method';
  public static GET_CACHED_TELEMETRY = 'cached_telemetry_analysis';
  public static GET_CACHED_ALERTS = 'cached_alert_analysis';
  public static GET_CACHED_ALERT_BY_ID = 'cached_alert_analysis/{0}';
  public static GET_ASSET_CONFIGURATION_HISTORY = 'apps/{0}/d2c/configuration_history';
  public static GET_DEVICE_DETAIL = 'apps/{0}/assets/{1}';
  public static GET_LIVE_WIDGETS_FOR_MODEL = 'apps/{0}/asset_types/{1}/live_widgets';
  public static SYNC_MODEL_CACHE = 'apps/{0}/cache/sync_asset_type';
  public static SYNC_DEVICE_CACHE = 'apps/{0}/cache/sync_assets';
  public static CALL_DEVICE_METHOD = 'apps/{0}/iot_assets/{1}/call_direct_method';
  public static GET_DEVICE_METHODS = 'apps/{0}/c2d/direct_method_calls';
  public static GET_DEVICE_METHOD_BY_ID = 'apps/{0}/c2d/direct_method_calls/{1}';
  public static GET_DEVICE_FIRST_TELEMETRY = 'apps/{0}/d2c/first_telemetry';
  public static GET_DEVICE_LAST_TELEMETRY = 'apps/{0}/d2c/last_telemetry';
  public static GET_DEVICE_MAINTENANCE_DATA = 'apps/{0}/assets/{1}/maintenance_history';
  public static CREATE_DEVICE_MAINTENANCE_DATA = 'apps/{0}/assets/{1}/maintenance_history';
  public static DELETE_DEVICE_MAINTENANCE_DATA = 'apps/{0}/assets/{1}/maintenance_history/{2}';
  public static UPDATE_DEVICE_MAINTENANCE_DATA = 'apps/{0}/assets/{1}/maintenance_history/{2}';
  public static UPDATE_DEVICE_METADATA = 'apps/{0}/assets/{1}/metadata';
  public static GET_PRE_GENERATED_REPORTS = 'apps/{0}/report_registry';
  public static GET_PACKAGES = 'apps/{0}/asset_types/{1}/packages';
  public static CREATE_PACKAGE = 'apps/{0}/asset_types/{1}/packages';
  public static UPDATE_PACKAGE = 'apps/{0}/asset_types/{1}/packages/{2}';
  public static DELETE_PACKAGE = 'apps/{0}/asset_types/{1}/packages/{2}';
  public static GET_DEVICE_TWIN = 'apps/{0}/iot_assets/{1}/twin_properties';
  public static UPDATE_DEVICE_TWIN = 'apps/{0}/iot_assets/{1}/twin_desired_properties';
  public static GET_DEVICE_TWIN_HISTORY = 'apps/{0}/d2c/twin_updates';
  public static ATTACH_LEGACY_DEVICE_TO_GATEWAY = 'apps/{0}/iot_assets/{1}/attach_legacy_asset';
  public static GET_NETWORK_FAILURE_EVENT = 'apps/{0}/assets/{1}/telemetry_loss_events';
  public static GET_MACHINE_FAILURE_EVENT = 'apps/{0}/assets/{1}/mttr_events';
  public static UPDATE_MTTR_RECORD = 'apps/{0}/assets/{1}/telemetry_loss_events/{2}';
  public static GET_MTBF_EVENTS = 'apps/{0}/assets/{1}/mtbf_events';
  public static GET_HISTORICAL_MTTR_DATA = 'apps/{0}/assets/{1}/historical_mttr_events';
  public static GET_HISTORICAL_MTBF_DATA = 'apps/{0}/assets/{1}/historical_mtbf_events';
  public static DELETE_USER_ACCESS = 'apps/{0}/users/{1}';
  public static GET_DEVICE_MODEL_RULES = 'apps/{0}/asset_types/{1}/rules';
  public static GET_DEVICE_MODEL_DERIVED_KPIS = 'apps/{0}/asset_types/{1}/derived_kpis';
  public static GET_DERIVED_KPI_LATEST_DATA = 'apps/{0}/derived_kpis/{1}/asset_wise_latest_data';
  public static GET_DERIVED_KPI_HISTORICAL_DATA = 'apps/{0}/derived_kpis/{1}/processing_history';
  public static GET_MODEL_SLAVE_DETAILS = 'apps/{0}/asset_models/{1}/slaves';
  public static CREATE_MODEL_SLAVE_DETAILS = 'apps/{0}/asset_models/{1}/slaves';
  public static UPDATE_MODEL_SLAVE_DETAILS = 'apps/{0}/asset_models/{1}/slaves/{2}';
  public static DELETE_MODEL_SLAVE_DETAILS = 'apps/{0}/asset_models/{1}/slaves/{2}';
  public static GET_MODEL_SLAVE_POSITIONS = 'apps/{0}/asset_models/{1}/slave_positions';
  public static CREATE_MODEL_SLAVE_POSITIONS = 'apps/{0}/asset_models/{1}/slave_positions';
  public static UPDATE_MODEL_SLAVE_POSITIONS = 'apps/{0}/asset_models/{1}/slave_positions/{2}';
  public static DELETE_MODEL_SLAVE_POSITIONS = 'apps/{0}/asset_models/{1}/slave_positions/{2}';
  public static GET_MODEL_SLAVE_CATEGORIES = 'apps/{0}/asset_models/{1}/slave_categories';
  public static CREATE_MODEL_SLAVE_CATEGORIES = 'apps/{0}/asset_models/{1}/slave_categories';
  public static UPDATE_MODEL_SLAVE_CATEGORIES = 'apps/{0}/asset_models/{1}/slave_categories/{2}';
  public static DELETE_MODEL_SLAVE_CATEGORIES = 'apps/{0}/asset_models/{1}/slave_categories/{2}';
  public static GET_DEVICE_SLAVE_DETAILS = 'apps/{0}/assets/{1}/slaves';
  public static CREATE_DEVICE_SLAVE_DETAILS = 'apps/{0}/assets/{1}/slaves';
  public static UPDATE_DEVICE_SLAVE_DETAILS = 'apps/{0}/assets/{1}/slaves/{2}';
  public static DELETE_DEVICE_SLAVE_DETAILS = 'apps/{0}/assets/{1}/slaves/{2}';
}
