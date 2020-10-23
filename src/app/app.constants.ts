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
      page: 'Things Modelling',
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

  public static PROPERTY_DATA_TYPE_LIST = [
    {
      name: 'Number',
      validations: ['minValue', 'maxValue', 'precision', 'units', 'defaultValue']
    },
    {
      name: 'Boolean',
      validations: ['defaultValue']
    },
    {
      name: 'String',
      validations: ['units', 'defaultValue']
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
  public static APP_ADMIN_ROLE = 'App Admin';
  public static DEFAULT_APP_ICON = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/default_app_icon.png';
  public static DEFAULT_APP_LOGO = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/default_app_logo.jpg';
  public static DEFAULT_HEADER_LOGO = 'https://storageaccountkemsy96a3.blob.core.windows.net/rdm-images/app-images/header-logo/logo.png';
}
