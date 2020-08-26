export class CONSTANTS {
  // application logo and icon detail
  public static APP_DATA = {
    IDEX: {
      logo: './assets/img/idex_logo.svg', // logo image for application dashboard and control panel
      icon: './assets/img/idex_icon.svg' // icon for application dashboard device icon
    },
    ccd: {
      logo: './assets/img/ccd_logo.png',
      icon: './assets/img/ccd_icon.svg'
    },
    Adani: {
      logo: './assets/img/adani_logo.png',
      icon: './assets/img/adani_icon.png'
    }
  };
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
  ]
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
    IDEX: [
      'temperature',
      'flow',
      'pressure'
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
      display: false
    },
    {
      name: 'LoRa',
      connectivity: ['LoRa Node -> LoRa Public Gateway -> Azure Integration -> Cloud',
      'LoRa Node -> LoRa Private Gateway -> Azure IOT Hub SDK -> Cloud',
      'LoRa Node -> LoRa Private Gateway -> MQTT Client -> Cloud'],
      display: false
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
  ]

  public static USER_DETAILS = 'userData';

}
