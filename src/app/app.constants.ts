export class CONSTANTS {

  public static DEVICE_RESERVED_TAGS_LIST = [
    {
      name: 'Created By',
      key: 'created_by'
    },
    {
      name: 'Created On',
      key: 'local_created_date'
    },
    {
      name: 'Device Manager',
      key: 'device_manager'
    },
    {
      name: 'Device Type',
      key: 'device_type'
    },
    {
      name: 'Location Coordinates',
      key: 'location_coordinates'
    },
    {
      name: 'Manufacturer',
      key: 'manufacturer'
    },
    {
      name: 'Serial No',
      key: 'serial_number'
    },
    {
      name: 'MAC ID',
      key: 'mac_address'
    },
    {
      name: 'Protocol',
      key: 'protocol'
    }
  ];
  // device tags list based on device protocol
  public static DEVICE_PROTOCOL_BASED_TAGS_LIST = {
    'IP Device (SIM)': [
      {
        name: 'SIM No',
        key: 'sim_no'
      },
      {
        name: 'SIM Service Provider',
        key: 'sim_service_provider'
      },
      {
        name: 'SIM IMEI No',
        key: 'sim_imei'
      },
      {
        name: '2G/3G/4G',
        key: 'network_option'
      }
      ],
    LoRa: [
      {
        name: 'LoRa Class Type'
      },
      {
        name: 'LoRa Service Provider'
      },
      {
        name: 'Activation Type'
      },
      {
        name: 'DevEUI'
      },
      {
        name: 'DevAddr'
      },
      {
        name: 'AppEUI'
      },
      {
        name: 'GatewayEUI'
      }
    ]
  };

  public static PROTOCOL_CONNECTIVITY_LIST = [
    {
      name: 'IP Device (WiFi)',
      connectivity: ['IP Device -> Azure IOT Hub SDK -> WiFi -> Cloud', 'IP Device -> MQTT Client -> WiFi -> Cloud'],
      display: true
    },
    {
      name: 'IP Device (SIM)',
      connectivity: ['IP Device -> Azure IOT Hub SDK -> SIM -> Cloud', 'IP Device -> MQTT Client -> SIM -> Cloud'],
      display: true
    },
    {
      name: 'BLE',
      connectivity: ['BLE Device -> Mobile App -> Azure IOT Hub SDK -> Cloud', 'BLE Device -> Mobile App -> MQTT Client -> Cloud',
    'BLE Device -> Gateway -> Azure IOT Hub SDK -> Cloud', 'BLE Device -> Gateway -> MQTT Client -> Cloud'],
      display: true
    },
    {
      name: 'LoRa',
      connectivity: ['LoRa Node -> LoRa Public Gateway -> Azure Integration -> Cloud',
      'LoRa Node -> LoRa Private Gateway -> Azure IOT Hub SDK -> Cloud',
      'LoRa Node -> LoRa Private Gateway -> MQTT Client -> Cloud'],
      display: true
    },
    {
      name: 'ModBus',
      connectivity: [],
      display: true
    },
    {
      name: 'NB-IoT',
      connectivity: ['NB-IoT Node -> Public Gateway -> Azure Integration -> Cloud'],
      display: true
    },
    {
      name: 'LwM2M',
      connectivity: ['LwM2M Node -> LwM2M Server -> Azure Integration -> Cloud'],
      display: true
    },
    {
      name: 'Other',
      connectivity: ['Custom Protocol -> IoT Gateway -> Azure IoT Hub SDK -> Azure Cloud', 'Custom Protocol -> IoT Gateway -> MQTT Client -> Azure Cloud'],
      display: true
    }
  ];

  public static NON_IP_DEVICE_OPTIONS = [
    {
      name: 'BLE Mesh Devices',
      protocol: 'BLE'
    },
    {
      name: 'BLE Beacon Devices',
      protocol: 'BLE'
    },
    {
      name: 'LoRa Devices',
      protocol: 'LoRa'
    },
    {
      name: 'ModBus Devices',
      protocol: 'ModBus'
    }
  ];

  public static SIDE_MENU_LIST = [
    {
      page: 'Home',
      system_name: 'Home',
      url: 'applications/:appName',
      display_name: 'Home',
      icon: 'fas fa-fw fa-home',
      visible: true
    },
    {
      page: 'Dashboard',
      system_name: 'Dashboard',
      url: 'applications/:appName/dashboard',
      display_name: 'Dashboard',
      icon: 'fas fa-fw fa-bar-chart',
      visible: true
    },
    {
      page: 'Devices',
      system_name: 'IoT Devices',
      url: 'applications/:appName/devices',
      display_name: 'IoT Devices',
      icon: 'fas fa-fw fa-desktop',
      visible: true
    },
    {
      page: 'Gateways',
      system_name: 'IoT Gateways',
      url: 'applications/:appName/gateways',
      display_name: 'IoT Gateways',
      icon: 'fas fa-fw fa-desktop',
      visible: true
    },
    {
      page: 'Non IP Devices',
      system_name: 'Non IP Devices',
      url: 'applications/:appName/nonIPDevices',
      display_name: 'Non IP Devices',
      icon: 'fas fa-fw fa-folder',
      visible: true
    },
    {
      page: 'alerts',
      system_name: 'Things Modelling',
      url: 'applications/:appName/things/model',
      display_name: 'Asset Modelling',
      icon: 'fas fa-fw fa-list',
      visible: true
    },
    {
      page: 'Device Groups',
      system_name: 'Device Groups',
      url: null,
      display_name: 'Device Groups',
      icon: 'fas fa-fw fa-table',
      visible: true,
      children: [
        {
          page: 'Group Jobs',
          system_name: 'Group Jobs',
          url: null,
          display_name: 'Group Jobs',
          visible: true
        },
        {
          page: 'Group Type',
          system_name: 'Group Type',
          url: null,
          display_name: 'Group Type',
          visible: true
        }
      ]
    },
    {
      page: 'Alert Visualization',
      system_name: 'Alert Visualization',
      url: 'applications/:appName/data/visualization',
      display_name: 'Alert Visualization',
      icon: 'fas fa-fw fa-chart-bar',
      visible: true
    },
    {
      page: 'App Settings',
      system_name: 'App Settings',
      url: 'applications/:appName/settings',
      display_name: 'App Settings',
      icon: 'fas fa-fw fa-cog',
      visible: true
    }
  ];

  public static DEVICE_CONTROL_PANEL_SIDE_MENU_LIST = [
    {
      page: 'manage',
      system_name: 'Manage',
      url: null,
      display_name: 'Manage',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'overview',
      system_name: 'Overview',
      url: '#device_overview',
      display_name: 'Overview',
      icon: 'fas fa-fw fa-life-ring',
      visible: true,
      isTitle: false
    },
    {
      page: 'access_control',
      system_name: 'Access Control',
      url: '#device_access_control',
      display_name: 'Access Control (IAM)',
      icon: 'fas fa-fw fa-users',
      visible: true,
      isTitle: false
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#device_tags',
      display_name: 'Tags',
      icon: 'fas fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'd2c',
      system_name: 'D2C (Monitor)',
      url: null,
      display_name: 'D2C (Monitor)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'heartbeat',
      system_name: 'Heartbeat',
      url: '#device_heartbeat',
      display_name: 'Heartbeat',
      icon: 'fas fa-fw fa-heartbeat',
      visible: true,
      isTitle: false
    },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#device_notifications',
      display_name: 'Notifications',
      icon: 'fas fa-fw fa-bell',
      visible: true,
      isTitle: false
    },
    {
      page: 'alerts',
      system_name: 'Alerts',
      url: '#device_alerts',
      display_name: 'Alerts',
      icon: 'fas fa-fw fa-bolt',
      visible: true,
      isTitle: false
    },
    {
      page: 'telemetry',
      system_name: 'Telemetry',
      url: '#device_telemetry',
      display_name: 'Telemetry',
      icon: 'fas fa-fw fa-history',
      visible: true,
      isTitle: false
    },
    {
      page: 'error',
      system_name: 'Error',
      url: '#device_error',
      display_name: 'Error',
      icon: 'fas fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    {
      page: 'battery_message',
      system_name: 'Batery',
      url: '#device_battery_message',
      display_name: 'Batery',
      icon: 'fas fa-fw fa-battery-full',
      visible: true,
      isTitle: false
    },
    {
      page: 'logs',
      system_name: 'Logs',
      url: '#device_logs',
      display_name: 'Logs',
      icon: 'fas fa-fw fa-file',
      visible: true,
      isTitle: false
    },
    {
      page: 'other',
      system_name: 'Other',
      url: '#device_other',
      display_name: 'Other',
      icon: 'fas fa-fw fa-poll-h',
      visible: true,
      isTitle: false
    },
    {
      page: 'c2d',
      system_name: 'C2D (Control)',
      url: null,
      display_name: 'C2D (Control)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'control_widgets',
      system_name: 'Control Widgets',
      url: '#device_control_widgets',
      display_name: 'Control Widgets',
      icon: 'fas fa-fw fa-angle-right',
      visible: true,
      isTitle: false
    },
    {
      page: 'visualization',
      system_name: 'Visualizations',
      url: 'null',
      display_name: 'Visualization',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'trend-analysis',
      system_name: 'Trend Analysis',
      url: '#device_trend_analysis',
      display_name: 'Trend Analysis',
      icon: 'fas fa-fw fa-stream',
      visible: true,
      isTitle: false
    },
    {
      page: 'recommendations',
      system_name: 'AI / ML Recommendations',
      url: null,
      display_name: 'AI / ML Recommendations',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'predictiveMaintenance',
      system_name: 'Preventive Maintenance',
      url: '#device_preventive_maintenance',
      display_name: 'Preventive Maintenance',
      icon: 'fas fa-fw fa-stream',
      visible: true,
      isTitle: false
    },
    {
      page: 'predictiveMaintenance',
      system_name: 'Predictive Maintenance',
      url: '#device_predictive_maintenance',
      display_name: 'Predictive Maintenance',
      icon: 'fas fa-fw fa-stream',
      visible: true,
      isTitle: false
    }
  ];

  public static MODEL_CONTROL_PANEL_SIDE_MENU_LIST = [
    {
      page: 'manage',
      system_name: 'Manage',
      url: null,
      display_name: 'Manage',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'overview',
      system_name: 'Overview',
      url: '#device_type_overview',
      display_name: 'Overview',
      icon: 'fas fa-fw fa-life-ring',
      visible: true,
      isTitle: false
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#device_type_tags',
      display_name: 'Tags',
      icon: 'fas fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'capabilities',
      system_name: 'Capabilities',
      url: null,
      display_name: 'Capabilities',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'measured_properties',
      system_name: 'Measured Properties',
      url: '#device_type_properties',
      display_name: 'Measured Properties',
      icon: 'fas fa-fw fa-history',
      visible: true,
      isTitle: false
    },
    {
      page: 'readable_properties',
      system_name: 'Readable Properties',
      url: '#device_type_properties',
      display_name: 'Readable Properties',
      icon: 'fas fa-fw fa-book',
      visible: true,
      isTitle: false
    },
    {
      page: 'writable_properties',
      system_name: 'Writable Properties',
      url: '#device_type_properties',
      display_name: 'Writable Properties',
      icon: 'fas fa-fw fa-pencil-square-o',
      visible: true,
      isTitle: false
    },
    {
      page: 'device_methods',
      system_name: 'Device Methods(commands)',
      url: '#device_type_methods',
      display_name: 'Device Methods(commands)',
      icon: 'fas fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'd2c',
      system_name: 'D2C (Monitor)',
      url: null,
      display_name: 'D2C (Monitor)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'jsonpacket',
      system_name: 'JSON Packet Format',
      url: '#device_type_jsonpacket',
      display_name: 'JSON Packet Format',
      icon: 'fas fa-fw fa-heartbeat',
      visible: true,
      isTitle: false
    },
    {
      page: 'alert_conditioning',
      system_name: 'Alert Conditioning',
      url: '#device_type_alert_conditioning',
      display_name: 'Alert Conditioning',
      icon: 'fas fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    {
      page: 'c2d',
      system_name: 'C2D (Control)',
      url: null,
      display_name: 'C2D (Control)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'control_widgets',
      system_name: 'Control Widgets',
      url: '#device_type_control_widgets',
      display_name: 'Control Widgets',
      icon: 'fas fa-fw fa-angle-right',
      visible: true,
      isTitle: false
    },
    {
      page: 'visualization',
      system_name: 'Visualizations',
      url: 'null',
      display_name: 'Visualization',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'layout',
      system_name: 'Widgets',
      url: '#device_type_layout',
      display_name: 'Widgets',
      icon: 'fas fa-fw fa-bar-chart',
      visible: true,
      isTitle: false
    },
    {
      page: 'reference_material',
      system_name: 'Reference Material',
      url: null,
      display_name: 'Reference Material',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'reference_material',
      system_name: 'Documents',
      url: '#device_type_reference_material',
      display_name: 'Documents',
      icon: 'fas fa-fw fa-file-alt',
      visible: true,
      isTitle: false
    }
  ];

  public static PROPERTY_DATA_TYPE_LIST = [
    {
      name: 'Number',
      validations: ['minValue', 'maxValue', 'precision', 'units', 'defaultValue']
    },
    {
      name: 'Boolean',
      validations: ['trueValue', 'falseValue', 'defaultValue']
    },
    {
      name: 'String',
      validations: ['minLength', 'maxLength', 'units', 'defaultValue']
    },
    {
      name: 'Enum',
      validations: ['enum', 'defaultValue']
    }
  ];

  public static DEVICE_METHODS = [
    'REBOOT',
    'FOTA',
    'TELEMETRY_INTERVAL_CHANGE'
  ];

  public static USER_DETAILS = 'userData';
  public static CURRENT_BREADCRUMB_STATE = 'breadcrumbState';
  public static NON_IP_DEVICES = 'Non IP Devices';
  public static IP_DEVICE = 'IoT Device';
  public static IP_GATEWAY = 'IoT Gateway';
  public static NON_IP_DEVICE = 'Non IP Device';
  public static NOT_ALLOWED_SPECIAL_CHARS_NAME = [' ', '.', '$', '#'];
  public static PASSWORD_REGEX = '^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,20}$';
  public static APP_ADMIN_ROLE = 'App Admin';
  public static DEFAULT_APP_ICON = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/default_app_icon.png';
  public static DEFAULT_APP_LOGO = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/default_app_logo.jpg';
  public static DEFAULT_HEADER_LOGO = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/app-images/header-logo/logo.png';
}
