export class AppUrls {
  public static GET_APPLICATION_DASHBOARD_SNAPSHOT = 'apps/{0}/device_statistics';
  public static GET_DEVICE_FILTER_LIST = 'DLM_GetDevices';
  public static GET_DEVICE_DATA = 'DLM_GetDeviceTwin';
  public static UPDATE_DEVICE_TAGS = 'DLM_SetDeviceTags';
  public static GET_DEVICE_LIFECYCLE_EVENTS = 'DLM_GetDeviceLifeCycleEvents';
  public static GET_HEARTBEAT_LIST = 'D2C_GetDeviceHeartbeats';
  public static GET_NOTIFICAION_LIST = 'D2C_GetDeviceNotifications';
  public static GET_ALERTS_LIST = 'D2C_GetDeviceAlerts';
  public static GET_ALERT_END_EVENT_LIST = 'D2C_GetDeviceAlertEndEvents';
  public static GET_TELEMETRY_LIST = 'D2C_GetDeviceTelemetry';
  public static GET_ERROR_LIST = 'D2C_GetDeviceErrors';
  public static GET_OTHER_MESSAGE_LIST = 'D2C_GetDeviceOtherMessages';
  public static GET_DEVICE_BATTERY_LIST = 'D2C_GetDeviceBatteryMessages';
  public static GET_C2D_MESSAGE_LIST = 'apps/{0}/c2d/messages';
  public static GET_QUEUE_MESSAGE_COUNT = 'apps/{0}/c2d/queue_message_count';
  public static PURGE_QUEUE_MESSAGE = 'apps/{0}/c2d/purge_messages';
  public static GET_C2D_MESSAGE_JSON = 'apps/{0}/c2d/messages/{1}';
  public static GET_C2D_RESPONSE_JSON = 'D2C_GetDeviceResponses';
  public static GET_DEVICE_CREDENTIALS = 'DLM_GetDeviceCredentials';
  public static GET_DEVICE_CONNECTION_STATUS = 'DLM_GetDeviceConnectionStatus';
  public static ENABLE_DEVICE = 'DLM_EnableDevice';
  public static DISABLE_DEVICE = 'DLM_DisableDevice';
  public static DELETE_DEVICE = 'DLM_DeleteDevice';
  public static CREATE_DEVICE = 'DLM_CreateDevice';
  public static SEND_C2D_MESSAGE = 'apps/{0}/c2d/messages';
  public static LOGIN = 'login';
  public static GET_APPLICATIONS_LIST = 'apps';
  public static CREATE_APP = 'apps';
  public static UPDATE_APP = 'apps/{0}';
  public static CREATE_USER = 'apps/{0}/users';
  public static CREATE_NON_IP_DEVICE = 'apps/{0}/legacy_devices';
  public static GET_NON_IP_DEVICE = 'apps/{0}/legacy_devices';
  public static DELETE_NON_IP_DEVICE = 'apps/{0}/legacy_devices/{1}';
  public static UPDATE_NON_IP_DEVICE_TAGS = 'apps/{0}/legacy_devices/{1}/tags';
  public static GE_NON_IP_DEVICES_COUNT = 'apps/{0}/legacy_devices_count';
  public static GET_APP_DETAILS = 'apps/{0}';
  public static GET_APP_USERS = 'apps/{0}/users';
  public static CREATE_LAYOUT = 'layout';
  public static GET_LAYOUT = 'layouts';
  public static GET_THINGS_MODELS = 'apps/{0}/device_types';
  public static CREATE_THINGS_MODEL = 'apps/{0}/device_types';
  public static UPDATE_THINGS_MODEL = 'apps/{0}/device_types/{1}';
  public static GET_THINGS_MODEL_PROPERTIES = 'apps/{0}/device_types/{1}/properties';
  public static GET_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/device_types/{1}/control_widgets';
  public static CREATE_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/device_types/{1}/control_widget';
  public static UPDATE_THINGS_MODEL_CONTROL_WIDGETS = 'apps/{0}/device_types/{1}/control_widget/{2}';
  public static GET_THINGS_MODEL_DEVICE_METHODS = 'apps/{0}/device_types/{1}/device_methods';
  public static GET_THINGS_MODEL_LAYOUT = 'apps/{0}/device_types/{1}/historical_widgets';
  public static ACKNOWLEGE_DEVICE_ALERT = 'D2C_UpdateAlertMetadata';
  public static DELETE_CONTROL_WIDGET = 'apps/{0}/device_types/{1}/control_widget/{2}';
  public static UPDATE_APP_HIERARCHY = 'apps/{0}/hierarchy';
  public static UPDATE_APP_ROLES = 'apps/{0}/roles';
  public static RESET_PASSWORD = 'users/reset_password';
  public static GET_ALERT_MESSAGE_BY_ID = 'D2C_GetDeviceAlertMessage';
  public static GET_ALERT_END_EVENT_MESSAGE_BY_ID = 'D2C_GetDeviceAlertEndEventMessage';
  public static GET_TELEMETRY_MESSAGE_BY_ID = 'D2C_GetDeviceTelemetryMessage';
  public static GET_BATTERY_MESSAGE_BY_ID = 'D2C_GetDeviceBatteryMessage';
  public static GET_HEARTBEAT_MESSAGE_BY_ID = 'D2C_GetDeviceHeartbeat';
  public static GET_LOG_MESSAGE_BY_ID = 'D2C_GetDeviceLog';
  public static GET_NOTIFICATION_MESSAGE_BY_ID = 'D2C_GetDeviceNotification';
  public static GET_OTHER_MESSAGE_BY_ID = 'D2C_GetDeviceOtherMessage';
  public static GET_ERROR_MESSAGE_BY_ID = 'D2C_GetDeviceError';
  public static GET_NON_IP_DEVICE_TAGS = 'apps/{0}/legacy_devices/{1}/tags';
  public static GET_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/device_types/{1}/reference_documents';
  public static CREATE_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/device_types/{1}/reference_documents';
  public static DELETE_MODEL_REFERENCE_DOCUMENTS = 'apps/{0}/device_types/{1}/reference_documents/{2}';
  public static GET_ALERT_CONDITIONS = 'apps/{0}/device_types/{1}/alert_conditions';
  public static CREATE_ALERT_CONDITION = 'apps/{0}/device_types/{1}/alert_conditions';
  public static UPDATE_ALERT_CONDITION = 'apps/{0}/device_types/{1}/alert_conditions/{2}';
  public static DELETE_ALERT_CONDITION = 'apps/{0}/device_types/{1}/alert_conditions/{2}';
  public static GET_IOT_LEGACY_DEVICES = 'apps/{0}/devices';
  public static GET_REPORT_TELEMETRY_DATA = 'apps/{0}/d2c/telemetry_report';
  public static SIGNALR_NEGOTIATE = 'signalr/negotiate';
  public static GET_MODEL_ALERT_REASONS = 'apps/{0}/device_types/{1}/alert_acknowledge_reasons';
  public static GET_SAMPLING_DEVICE_TELEMETRY = 'apps/{0}/d2c/telemetry_messages_with_sampling';
  public static GET_DEVICE_SIGNALR_MODE = 'apps/{0}/devices/{1}/get_telemetry_mode';
  //public static CHANGE_TELEMETRY_MODE = 'apps/{0}/c2d/change_telemetry_mode';
  public static CHANGE_TELEMETRY_MODE = 'apps/{0}/c2d/change_telemetry_mode_using_direct_method';
  public static GET_CACHED_TELEMETRY = 'cached_telemetry_analysis';
  public static GET_CACHED_ALERTS = 'cached_alert_analysis';
  public static GET_CACHED_ALERT_BY_ID = 'cached_alert_analysis/{0}';
  public static GET_ASSET_CONFIGURATION_HISTORY = 'apps/{0}/d2c/configuration_history';
  public static GET_DEVICE_DETAIL = 'apps/{0}/devices/{1}';
  public static GET_LIVE_WIDGETS_FOR_MODEL = 'apps/{0}/device_types/{1}/live_widgets';
  public static SYNC_MODEL_CACHE = 'apps/{0}/cache/sync_device_type';
  public static SYNC_DEVICE_CACHE = 'apps/{0}/cache/sync_devices';
  public static CALL_DEVICE_METHOD = 'apps/{0}/c2d/call_direct_method';
}
