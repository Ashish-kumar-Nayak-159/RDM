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
      logo: './assets/img/adani_logo.jpg',
      icon: './assets/img/adani_icon.jpg'
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
      key: 'created_date'
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

  public static USER_DETAILS = 'userData';

}
