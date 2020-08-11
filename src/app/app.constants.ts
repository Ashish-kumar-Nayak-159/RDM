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
  // device tags list based on device protocol
  public static DEVICE_TAGS_LIST = {
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

}
