export class CONSTANTS {
  // user list for login check
  public static USERS_LIST = [
    {
      email: 'sombabu@kemsys.com',
      username: 'Sombabu Gunithi',
      password: 'admin',
      app: 'Adani'
    },
    {
      email: 'yash@kemsys.com',
      username: 'Yash Mochi',
      password: 'admin',
      app: 'IDEX'
    },
    {
      email: 'urvisha@kemsys.com',
      username: 'Urvisha Seladiya',
      password: 'admin',
      app: 'ccd'
    }
  ];

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
      name: 'Location',
      key: 'location'
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

  public static APP_PROP_LIST = {
    ccd: [
      'temperature',
      'flow',
      'pressure',
      'R_Bus_Temperature',
      'Y_Bus_Temperature',
      'B_Bus_Temperature',
      'R_Bus_Voltage',
      'Y_Bus_Voltage',
      'B_Bus_Voltage',
      'voltage',
      'phase_current',
      'neutral_current',
      'frequency_Hz',
      'cumulative_energy_kWh'
    ],
    IDEX: [
      'temperature',
      'flow',
      'pressure',
    ],
    Adani: [
    'R_Bus_Temperature',
    'Y_Bus_Temperature',
    'B_Bus_Temperature',
    'R_Bus_Voltage',
    'Y_Bus_Voltage',
    'B_Bus_Voltage'
    ],
    Kirloskar: [
      'SpindleTemp_0_path1_Top_Center_OP40',
      'PulseCoderTemp_2_path1_Top_Center_OP40',
      'ServoTemp_1_path1_Top_Center_OP40',
      'ServoTemp_2_path1_Top_Center_OP40',
      'PulseCoderTemp_0_path1_Top_Center_OP40',
      'PulseCoderTemp_1_path1_Top_Center_OP40',
      'ServoTemp_0_path1_Top_Center_OP40',
      'PulseCoderTemp_3_path1_Top_Center_OP40',
      'ServoTemp_3_path1_Top_Center_OP40'
    ],
    NTT: [
      'voltage',
      'phase_current',
      'neutral_current',
      'frequency_Hz',
      'cumulative_energy_kWh'
    ],
    IIoT_App: [
      'temperature',
      'flow',
      'pressure',
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
      display_name: 'Home'
    },
    {
      page: 'Devices',
      system_name: 'IoT Devices',
      url: 'applications/:appName/devices',
      display_name: 'IoT Devices'
    },
    {
      page: 'Gateways',
      system_name: 'IoT Gateways',
      url: 'applications/:appName/gateways',
      display_name: 'IoT Gateways'
    },
    {
      page: 'Non IP Devices',
      system_name: 'Non IP Devices',
      url: 'applications/:appName/nonIPDevices',
      display_name: 'Non IP Devices'
    },
    {
      page: 'Device Type',
      system_name: 'Device Type',
      url: null,
      display_name: 'Device Type'
    },
    {
      page: 'Device Groups',
      system_name: 'Device Groups',
      url: null,
      display_name: 'Device Groups',
      children: [
        {
          page: 'Group Jobs',
          system_name: 'Group Jobs',
          url: null,
          display_name: 'Group Jobs'
        },
        {
          page: 'Group Type',
          system_name: 'Group Type',
          url: null,
          display_name: 'Group Type'
        }
      ]
    },
    {
      page: 'Data Visualization',
      system_name: 'Data Visualization',
      url: 'applications/:appName/data/visualization',
      display_name: 'Data Visualization'
    },
    {
      page: 'App Settings',
      system_name: 'App Settings',
      url: 'applications/:appName/settings',
      display_name: 'App Settings'
    }
  ];

  public static USER_DETAILS = 'userData';
  public static CURRENT_BREADCRUMB_STATE = 'breadcrumbState';
  public static NON_IP_DEVICES = 'Non IP Devices';
  public static IP_DEVICE = 'IoT Device';
  public static IP_GATEWAY = 'IoT Gateway';
  public static NON_IP_DEVICE = 'Non IP Device';

}
