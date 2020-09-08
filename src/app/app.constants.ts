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
      display: false
    },
    {
      name: 'LwM2M',
      connectivity: ['LwM2M Node -> LwM2M Server -> Azure Integration -> Cloud'],
      display: false
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

  public static USER_DETAILS = 'userData';
  public static CURRENT_BREADCRUMB_STATE = 'breadcrumbState';
  public static IP_DEVICES_GATEWAYS = 'IP Devices & Gateways';
  public static IP_DEVICES = 'IP Devices';
  public static IP_GATEWAYS = 'IP Gateways';
  public static NON_IP_DEVICES = 'Non IP Devices';
  public static IP_DEVICE_GATEWAY = 'IP Device & Gateway';
  public static IP_DEVICE = 'IP Device';
  public static IP_GATEWAY = 'IP Gateway';
  public static NON_IP_DEVICE = 'Non IP Device';

}
