export class AppUrls {
  public static GET_APPLICATION_DASHBOARD_SNAPSHOT = 'dashboard/snapshot/get';
  public static GET_DEVICE_FILTER_LIST = 'DLM_GetDevices';
  public static GET_DEVICE_DATA = 'DLM_GetDeviceTwin';
  public static UPDATE_DEVICE_TAGS = 'DLM_SetDeviceTags';
  public static GET_DEVICE_LIFECYCLE_EVENTS = 'DLM_GetDeviceLifeCycleEvents';
  public static GET_HEARTBEAT_LIST = 'D2C_GetDeviceHeartbeats';
  public static GET_NOTIFICAION_LIST = 'D2C_GetDeviceNotifications';
  public static GET_ALERTS_LIST = 'D2C_GetDeviceAlerts';
  public static GET_TELEMETRY_LIST = 'D2C_GetDeviceTelemetry';
  public static GET_ERROR_LIST = 'D2C_GetDeviceErrors';
  public static GET_OTHER_MESSAGE_LIST = 'D2C_GetDeviceOtherMessages';
  public static GET_DEVICE_BATTERY_LIST = 'D2C_GetDeviceBatteryMessages';
  public static GET_C2D_MESSAGE_LIST = 'C2D_GetDeviceMessages';
  public static GET_QUEUE_MESSAGE_COUNT = 'C2D_GetQueueMessageCount';
  public static PURGE_QUEUE_MESSAGE = 'C2D_PurgeQueueMessages';
  public static GET_C2D_MESSAGE_JSON = 'C2D_GetDeviceMessage';
  public static GET_C2D_RESPONSE_JSON = 'D2C_GetDeviceResponses';
  public static GET_DEVICE_CREDENTIALS = 'DLM_GetDeviceCredentials';
  public static GET_DEVICE_CONNECTION_STATUS = 'DLM_GetDeviceConnectionStatus';
  public static ENABLE_DEVICE = 'DLM_EnableDevice';
  public static DISABLE_DEVICE = 'DLM_DisableDevice';
  public static DELETE_DEVICE = 'DLM_DeleteDevice';
  public static CREATE_DEVICE = 'DLM_CreateDevice';
  public static SEND_C2D_MESSAGE = 'C2D_SendMessage';
  public static LOGIN = 'App_Login';
  public static GET_APPLICATIONS_LIST = 'apps/get';
  public static CREATE_APP = 'App_CreateApp';
  public static UPDATE_APP = 'App_EditApp';
  public static CREATE_USER = 'App_CreateUser';
  public static CREATE_NON_IP_DEVICE = 'DDM_CreateNonIPDevice';
  public static GET_NON_IP_DEVICE = 'DDM_GetNonIPDevices';
  public static DELETE_NON_IP_DEVICE = 'DDM_DeleteNonIPDevice';
  public static UPDATE_NON_IP_DEVICE_TAGS = 'DDM_SetNonIPDeviceTags';
  public static GE_NON_IP_DEVICES_COUNT = 'DDM_GetNonIPDevicesCount';
  public static GET_APP_USERS = 'App_GetAppUsers';
  public static CREATE_LAYOUT = 'layout';
  public static GET_LAYOUT = 'layouts';
  public static GET_THINGS_MODELS = 'device_types';
  public static CREATE_THINGS_MODEL = 'device_type';
  public static UPDATE_THINGS_MODEL = 'device_type';
  public static GET_THINGS_MODEL_PROPERTIES = 'device_types/properties';
  public static GET_THINGS_MODEL_CONTROL_WIDGETS = 'device_type/control_widgets';
  public static CREATE_THINGS_MODEL_CONTROL_WIDGETS = 'device_type/control_widget';
  public static UPDATE_THINGS_MODEL_CONTROL_WIDGETS = 'device_type/control_widget';
  public static GET_THINGS_MODEL_DEVICE_METHODS = 'device_types/device_methods';
  public static GET_THINGS_MODEL_LAYOUT = 'device_types/layouts';
  public static ACKNOWLEGE_DEVICE_ALERT = 'D2C_UpdateAlertMetadata';
  public static DELETE_CONTROL_WIDGET = 'device_type/control_widget';
  public static UPDATE_APP_HIERARCHY = 'App_EditAppHierarchy';
  public static UPDATE_APP_ROLES = 'App_EditAppRoles';
}
