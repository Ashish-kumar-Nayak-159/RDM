import * as moment from 'moment';

export class CONSTANTS {

  public static ASSETAPPPS = [
    {id: 4, name: 'GatewayAgent', is_start: false, is_stop: false, is_restart: false, is_install: false, is_uninstall: false,
    is_update: true, display_name: 'Gateway Agent', metadata: {}, deleted: false, type: 'system_apps'},
    {id: 4, name: 'MQTTAgent', is_start: false, is_stop: false, is_restart: false, is_install: false, is_uninstall: false,
    is_update: true, display_name: 'MQTT Agent', metadata: {}, deleted: false, type: 'system_apps'},
    {id: 5, name: 'CachingAgent', is_start: false, is_stop: false, is_restart: false, is_install: false, is_uninstall: false,
    is_update: true, display_name: 'Caching Agent', metadata: {}, deleted: false, type: 'system_apps'},
    {id: 3, name: 'RuleEngine', is_start: true, is_stop: true, is_restart: true, is_install: true, is_uninstall: true,
    is_update: true, display_name: 'Rule Engine', metadata: {}, deleted: false, type: 'apps'},
    {id: 2, name: 'ModbusRTUMaster', is_start: true, is_stop: true, is_restart: true, is_install: true, is_uninstall: true,
    is_update: true, display_name: 'Modbus RTU App', metadata: {}, deleted: false, type: 'apps'},
    {id: 1, name: 'ModbusTCPMaster', is_start: true, is_stop: true, is_restart: true, is_install: true, is_uninstall: true,
    is_update: true, display_name: 'Modbus TCP App', metadata: {}, deleted: false, type: 'apps'},
    {id: 3, name: 'SiemensTCPIP', is_start: true, is_stop: true, is_restart: true, is_install: true, is_uninstall: true,
    is_update: true, display_name: 'Siemens TCP/IP App', metadata: {}, deleted: false, type: 'apps'},
    {id: 3, name: 'N_BlueNRG', is_start: true, is_stop: true, is_restart: true, is_install: true, is_uninstall: true,
    is_update: true, display_name: 'N_BlueNRG', metadata: {}, deleted: false, type: 'apps'}
  ];

  public static PROTOCOLS = [
    {id: 1, asset_model: 'IoT Asset', name: 'IP Asset (WiFi)', display_name: 'IP Asset (WiFi)', cloud_connectivity: ['IP Asset -> Azure IOT Hub SDK -> WiFi -> Cloud', 'IP Asset -> MQTT Client -> WiFi -> Cloud'], metadata: {}, deleted: false},
    {id: 2, asset_model: 'IoT Asset', name: 'IP Asset (SIM)', display_name: 'IP Asset (SIM)', cloud_connectivity: ['IP Asset -> Azure IOT Hub SDK -> SIM -> Cloud', 'IP Asset -> MQTT Client -> SIM -> Cloud'], metadata: {}, deleted: false},
    {id: 3, asset_model: 'IoT Gateway', name: 'IP Gateway (WiFi)', display_name: 'IP Gateway (WiFi)', cloud_connectivity: ['IP Gateway -> Azure IOT Hub SDK -> WiFi -> Cloud', 'IP Gateway -> MQTT Client -> WiFi -> Cloud'], metadata: {}, deleted: false},
    {id: 4, asset_model: 'IoT Gateway', name: 'IP Gateway (SIM)', display_name: 'IP Gateway (SIM)', cloud_connectivity: ['IP Gateway -> Azure IOT Hub SDK -> SIM -> Cloud', 'IP Gateway -> MQTT Client -> SIM -> Cloud'], metadata: {}, deleted: false},
    {id: 5, asset_model: 'Legacy Asset', name: 'ModbusTCPMaster', display_name: 'Modbus TCP', cloud_connectivity: ['ModBus TCP Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'ModbusTCPMaster'}, deleted: false},
    {id: 6, asset_model: 'Legacy Asset', name: 'ModbusRTUMaster', display_name: 'Modbus RTU', cloud_connectivity: ['ModBus RTU Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'ModbusRTUMaster'}, deleted: false},
    {id: 7, asset_model: 'Legacy Asset', name: 'SiemensTCPIP', display_name: 'Siemens TCP/IP', cloud_connectivity: ['Siemens TCP/IP Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'SiemensTCPIP'}, deleted: false},
    {id: 8, asset_model: 'Legacy Asset', name: 'BlueNRG', display_name: 'BlueNRG', cloud_connectivity: ['BLE Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'N_BlueNRG'}, deleted: false}
  ];

  public static NON_IP_ASSET_OPTIONS = [
    {
      name: 'BLE Mesh Assets',
      protocol: 'BLE'
    },
    {
      name: 'BLE Beacon Assets',
      protocol: 'BLE'
    },
    {
      name: 'LoRa Assets',
      protocol: 'LoRa'
    },
    {
      name: 'ModBus Assets',
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
      visible: true,
      exactMatch: true,
      showAccordion: [
        {
          name: 'Title',
          value: 'Home'
        }
      ],
      priority: 1
    },
    {
      page: 'Live Data',
      system_name: 'Live Data',
      url: 'applications/:appName/dashboard',
      display_name: 'Live Data',
      icon: 'fa fa-fw fa-chart-bar',
      visible: true,
      exactMatch: true,
      showAccordion: [
        {
          name: 'Title',
          value: 'Live Data'
        }
      ],
      priority: 1
    },
    {
      page: 'Live Alerts',
      system_name: 'Live Alerts',
      url: 'applications/:appName/alerts/visualization',
      display_name: 'Live Alerts',
      icon: 'fa fa-fw fa-bell',
      exactMatch: true,
      visible: true,
      showAccordion: [
        {
          name: 'Title',
          value: 'Live Alerts'
        }
      ],
      priority: 1
    },
    {
      page: 'Assets',
      system_name: 'Assets',
      url: 'applications/:appName/assets',
      display_name: 'Assets',
      for_admin_only: true,
      exactMatch: true,
      icon: 'fab fa-fw fa-mixcloud',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Assets'},
        { name: 'Records Limit', value: 20, type: 'number'},
        { name: 'IOT Assets', type: 'checkbox', value: true},
        { name: 'Legacy Assets', type: 'checkbox', value: true},
        { name: 'IOT Gateways', type: 'checkbox', value: true},
        { name: 'IOT Assets Tab Name', value: 'IOT Assets'},
        { name: 'IOT Assets Table Key Name', value: 'IOT Asset'},
        { name: 'IOT Gateways Tab Name', value: 'IOT Gateways'},
        { name: 'IOT Gateways Table Key Name', value: 'IOT Gateway'},
        { name: 'Legacy Assets Tab Name', value: 'Legacy Assets'},
        { name: 'Legacy Assets Table Key Name', value: 'Legacy Asset'},
      ],
      priority: 1
    },
    {
      page: 'Asset Management',
      system_name: 'Asset Management',
      url: 'applications/:appName/asset/management',
      display_name: 'Asset Management',
      for_admin_only: true,
      exactMatch: true,
      icon: 'fa fa-fw fa-cogs',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Asset Management'}
      ],
      priority: 1
    },
    {
      page: 'Asset Models',
      system_name: 'Asset Models',
      url: 'applications/:appName/assets/model',
      display_name: 'Asset Models',
      exactMatch: true,
      icon: 'icon icon-cubes',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Models'},
        { name: 'Table Key Name', value: 'Model'}
      ],
      priority: 1
    },
    // {
    //   page: 'Asset Groups',
    //   system_name: 'Asset Groups',
    //   url: null,
    //   display_name: 'Asset Groups',
    //   icon: 'fa fa-fw fa-table',
    //   visible: true,
    //   children: [
    //     {
    //       page: 'Group Jobs',
    //       system_name: 'Group Jobs',
    //       url: null,
    //       display_name: 'Group Jobs',
    //       visible: true,
    //       showAccordion: []
    //     },
    //     {
    //       page: 'Group Type',
    //       system_name: 'Group Type',
    //       url: null,
    //       display_name: 'Group Type',
    //       visible: true,
    //       showAccordion: []
    //     }
    //   ],
    //   priority: 1
    // },
    // {
    //   page: 'Alert Visualization',
    //   system_name: 'Alert Visualization',
    //   url: 'applications/:appName/data/visualization',
    //   display_name: 'Alert Visualization',
    //   icon: 'fa fa-fw fa-bar-chart',
    //   visible: true,
    //   showAccordion: [
    //     { name: 'Title', value: 'Alerts'},
    //   ],
    //   priority: 1
    // },
    {
      page: 'Reports',
      system_name: 'Reports',
      url: 'applications/:appName/reports',
      display_name: 'Reports',
      icon: 'fa fa-fw fa-chart-line',
      visible: true,
      exactMatch: true,
      showAccordion: [
        { name: 'Title', value: 'Reports'},
        { name: 'Records Limit', value: 100, type: 'number'}
      ],
      priority: 1
    },

    {
      page: 'Campaigns',
      system_name: 'Campaigns',
      url: 'applications/:appName/campaigns',
      display_name: 'Campaigns',
      icon: 'fa fa-fw fa-object-group',
      visible: true,
      exactMatch: true,
      showAccordion: [
        { name: 'Title', value: 'Campaigns'}
      ],
      priority: 1
    },
     {
      page: 'Non-provisioned Assets',
      system_name: 'Non-provisioned Assets',
      url: 'applications/:appName/asset/non-provisioned',
      display_name: 'Non-provisioned Assets',
      icon: 'fab fa-fw fa-mixcloud',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Non-provisioned Assets'}
      ],
      priority: 2
    }
    // {
    //   page: 'Gateways',
    //   system_name: 'IoT Gateways',
    //   url: 'applications/:appName/gateways',
    //   display_name: 'IoT Gateways',
    //   icon: 'fa fa-fw fa-desktop',
    //   visible: true,
    //   showAccordion: [
    //     { name: 'Title', value: 'Gateways'},
    //     { name: 'Table Key Name', value: 'Gateway'},
    //     { name: 'Records Limit', value: 20, type: 'number'},
    //   ],
    //   priority: 2
    // }
  ];

  public static ASSET_CONTROL_PANEL_SIDE_MENU_LIST = [
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
      url: '#asset_overview',
      display_name: 'Overview',
      icon: 'fa fa-fw fa-life-ring',
      visible: true,
      isTitle: false,
      showAccordion: [
      ],
      accordion_value: {}
    },
    {
      page: 'access_control',
      system_name: 'Access Control',
      url: '#asset_access_control',
      display_name: 'Access Control (IAM)',
      icon: 'fa fa-fw fa-users',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#asset_tags',
      display_name: 'Tags',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Delete all', key: 'delete'}
      ],
      accordion_value: { delete: true}
    },
    {
      page: 'slave_info',
      system_name: 'Sensor / Source / Slave Info',
      url: '#asset_model_slave_info',
      display_name: 'Sensor / Source / Slave Info',
      icon: 'fa fa-fw fa-user-secret',
      visible: true,
      isTitle: false
    },
    {
      page: 'package_management',
      system_name: 'Software Packages',
      url: '#asset_package_management',
      display_name: 'Software Packages',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false
    },
    {
      page: 'setup',
      system_name: 'Setup',
      url: '#asset_setup',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'd2c',
      system_name: 'Monitor (D2C)',
      url: null,
      display_name: 'Monitor (D2C)',
      icon: null,
      visible: true,
      isTitle: true
    },
    // {
    //   page: 'heartbeat',
    //   system_name: 'Heartbeat',
    //   url: '#asset_heartbeat',
    //   display_name: 'Heartbeat',
    //   icon: 'fa fa-fw fa-heartbeat',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'asset_life_cycle',
      system_name: 'Life Cycle Events',
      url: '#asset_life_cycle_events',
      display_name: 'Life Cycle Events',
      icon: 'fa fa-fw fa-heartbeat',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#asset_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alerts',
      system_name: 'Alert Raise Events',
      url: '#asset_alerts',
      display_name: 'Alert Raise Events',
      icon: 'fa fa-fw fa-bolt',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alertendevents',
      system_name: 'Alert End Events',
      url: '#asset_alert_end_events',
      display_name: 'Alert End Events',
      icon: 'fa fa-fw fa-hourglass-end',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'telemetry',
      system_name: 'Telemetry',
      url: '#asset_telemetry',
      display_name: 'Telemetry',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    // {
    //   page: 'error',
    //   system_name: 'Error',
    //   url: '#asset_error',
    //   display_name: 'Error',
    //   icon: 'fa fa-fw fa-exclamation-triangle',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    // {
    //   page: 'battery_message',
    //   system_name: 'Battery',
    //   url: '#asset_battery_message',
    //   display_name: 'Battery',
    //   icon: 'fa fa-fw fa-battery-full',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'logs',
      system_name: 'Logs',
      url: '#asset_logs',
      display_name: 'Logs',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alert_conditioning',
      system_name: 'Alert Conditioning',
      url: '#asset_alert_conditioning',
      display_name: 'Alert Conditioning',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    // {
    //   page: 'other',
    //   system_name: 'Other',
    //   url: '#asset_other',
    //   display_name: 'Other',
    //   icon: 'fa fa-fw fa-globe',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'c2d',
      system_name: 'Control (C2D)',
      url: null,
      display_name: 'Control (C2D)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'control_widgets',
      system_name: 'Control / Configure',
      url: '#asset_control_widgets',
      display_name: 'Control / Configure',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Configuration', key: 'configuration'},
        { name: 'Control', key: 'control'},
        { name: 'Purge', key: 'purge'}
      ],
      accordion_value: {configuration: true, control: true, purge: true}
    },
    {
      page: 'compute',
      system_name: 'Compute',
      url: 'null',
      display_name: 'Compute',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'stream_processing',
      system_name: 'Cloud Derived Properties',
      url: '#asset_stream_processing',
      display_name: 'Cloud Derived Properties',
      icon: 'fa fa-fw fa-globe',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'derived_kpis',
      system_name: 'Derived KPIs',
      url: '#asset_derived_kpis',
      display_name: 'Derived KPIs',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'rules',
      system_name: 'Rules',
      url: '#asset_rules',
      display_name: 'Rules',
      icon: 'fa fa-fw fa-archive',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'visualize',
      system_name: 'Visualize',
      url: 'null',
      display_name: 'Visualize',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'trend-analysis',
      system_name: 'Trend Analysis',
      url: '#asset_trend_analysis',
      display_name: 'Telemetry Trend Analysis',
      icon: 'fa fa-fw fa-area-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alert-visualization',
      system_name: 'Alert Visualization',
      url: '#asset_alert_visualization',
      display_name: 'Alert Visualization',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintain',
      system_name: 'Maintain',
      url: null,
      display_name: 'Maintain',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'mttr',
      system_name: 'MTTR',
      url: '#asset_mttr',
      display_name: 'MTTR',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'mtbf',
      system_name: 'MTBF',
      url: '#asset_mtbf',
      display_name: 'MTBF',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintenance_schedule',
      system_name: 'Maintenance Schedules',
      url: '#asset_maintenance_schedule',
      display_name: 'Maintenance Schedules',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'predictions',
      system_name: 'Predictions',
      url: '#asset_predictions',
      display_name: 'Predictions',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    }
  ];

  public static LEGACY_ASSET_CONTROL_PANEL_SIDE_MENU_LIST = [
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
      url: '#asset_overview',
      display_name: 'Overview',
      icon: 'fa fa-fw fa-life-ring',
      visible: true,
      isTitle: false,
      showAccordion: [
      ],
      accordion_value: {}
    },
    {
      page: 'access_control',
      system_name: 'Access Control',
      url: '#asset_access_control',
      display_name: 'Access Control (IAM)',
      icon: 'fa fa-fw fa-users',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#asset_tags',
      display_name: 'Tags',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Delete all', key: 'delete'}
      ],
      accordion_value: {delete: true}
    },
    {
      page: 'slave_info',
      system_name: 'Sensor / Source / Slave Info',
      url: '#asset_slave_info',
      display_name: 'Sensor / Source / Slave Info',
      icon: 'fa fa-fw fa-user-secret',
      visible: true,
      isTitle: false
    },
    // {
    //   page: 'package_management',
    //   system_name: 'Software Packages',
    //   url: '#asset_package_management',
    //   display_name: 'Software Packages',
    //   icon: 'fa fa-fw fa-file',
    //   visible: true,
    //   isTitle: false
    // },
    {
      page: 'setup',
      system_name: 'Setup',
      url: '#asset_setup',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'd2c',
      system_name: 'Monitor (D2C)',
      url: null,
      display_name: 'Monitor (D2C)',
      icon: null,
      visible: true,
      isTitle: true
    },
    // {
    //   page: 'heartbeat',
    //   system_name: 'Heartbeat',
    //   url: '#asset_heartbeat',
    //   display_name: 'Heartbeat',
    //   icon: 'fa fa-fw fa-heartbeat',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#asset_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alerts',
      system_name: 'Alert Raise Events',
      url: '#asset_alerts',
      display_name: 'Alert Raise Events',
      icon: 'fa fa-fw fa-bolt',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alertendevents',
      system_name: 'Alert End Events',
      url: '#asset_alert_end_events',
      display_name: 'Alert End Events',
      icon: 'fa fa-fw fa-hourglass-end',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'telemetry',
      system_name: 'Telemetry',
      url: '#asset_telemetry',
      display_name: 'Telemetry',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    // {
    //   page: 'error',
    //   system_name: 'Error',
    //   url: '#asset_error',
    //   display_name: 'Error',
    //   icon: 'fa fa-fw fa-exclamation-triangle',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    // {
    //   page: 'battery_message',
    //   system_name: 'Battery',
    //   url: '#asset_battery_message',
    //   display_name: 'Battery',
    //   icon: 'fa fa-fw fa-battery-full',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'logs',
      system_name: 'Logs',
      url: '#asset_logs',
      display_name: 'Logs',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alert_conditioning',
      system_name: 'Alert Conditioning',
      url: '#asset_alert_conditioning',
      display_name: 'Alert Conditioning',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    // {
    //   page: 'other',
    //   system_name: 'Other',
    //   url: '#asset_other',
    //   display_name: 'Other',
    //   icon: 'fa fa-fw fa-globe',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'c2d',
      system_name: 'Control (C2D)',
      url: null,
      display_name: 'Control (C2D)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'control_widgets',
      system_name: 'Control / Configure',
      url: '#asset_control_widgets',
      display_name: 'Control / Configure',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Configuration', key: 'configuration'},
        { name: 'Control', key: 'control'},
        { name: 'Purge', key: 'purge'}
      ],
      accordion_value: {configuration: true, purge: true, control: true}
    },
    {
      page: 'compute',
      system_name: 'Compute',
      url: 'null',
      display_name: 'Compute',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'stream_processing',
      system_name: 'Cloud Derived Properties',
      url: '#asset_stream_processing',
      display_name: 'Cloud Derived Properties',
      icon: 'fa fa-fw fa-globe',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'derived_kpis',
      system_name: 'Derived KPIs',
      url: '#asset_derived_kpis',
      display_name: 'Derived KPIs',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'rules',
      system_name: 'Rules',
      url: '#asset_rules',
      display_name: 'Rules',
      icon: 'fa fa-fw fa-archive',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'visualization',
      system_name: 'Visualize',
      url: 'null',
      display_name: 'Visualize',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'trend-analysis',
      system_name: 'Trend Analysis',
      url: '#asset_trend_analysis',
      display_name: 'Telemetry Trend Analysis',
      icon: 'fa fa-fw fa-area-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alert-visualization',
      system_name: 'Alert Visualization',
      url: '#asset_alert_visualization',
      display_name: 'Alert Visualization',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintain',
      system_name: 'Maintain',
      url: null,
      display_name: 'Maintain',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'mttr',
      system_name: 'MTTR',
      url: '#asset_mttr',
      display_name: 'MTTR',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'mtbf',
      system_name: 'MTBF',
      url: '#asset_mtbf',
      display_name: 'MTBF',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintenance_schedule',
      system_name: 'Maintenance Schedules',
      url: '#asset_maintenance_schedule',
      display_name: 'Maintenance Schedules',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'predictions',
      system_name: 'Predictions',
      url: '#asset_predictions',
      display_name: 'Predictions',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    }
  ];

  public static GATEWAY_DIAGNOSIS_PANEL_SIDE_MENU_LIST = [
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
      url: '#asset_overview',
      display_name: 'Overview',
      icon: 'fa fa-fw fa-life-ring',
      visible: true,
      isTitle: false,
      showAccordion: [
      ],
      accordion_value: {}
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#asset_tags',
      display_name: 'Tags',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Delete all', key: 'delete'}
      ],
      accordion_value: { delete: true}
    },
    {
      page: 'package_management',
      system_name: 'Software Packages',
      url: '#asset_package_management',
      display_name: 'Software Packages',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false
    },
    {
      page: 'setup',
      system_name: 'Setup',
      url: '#asset_setup',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'd2c',
      system_name: 'Monitor (D2C)',
      url: null,
      display_name: 'Monitor (D2C)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'current_config',
      system_name: 'Current Configuration',
      url: '#asset_current_config',
      display_name: 'Current Configuration',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'config_history',
      system_name: 'Configuration History',
      url: '#asset_config_history',
      display_name: 'Configuration History',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#asset_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'asset_life_cycle',
      system_name: 'Life Cycle Events',
      url: '#asset_life_cycle_events',
      display_name: 'Life Cycle Events',
      icon: 'fa fa-fw fa-heartbeat',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'cached_alerts',
      system_name: 'Cached Alerts',
      url: '#asset_cached_alerts',
      display_name: 'Cached Alerts',
      icon: 'fa fa-fw fa-bolt',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'cached_telemetry',
      system_name: 'Cached Telemetry',
      url: '#asset_cached_telemetry',
      display_name: 'Cached Telemetry',
      icon: 'fa fa-fw fa-globe',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'count',
      system_name: 'Telemetry Count',
      url: '#asset_count',
      display_name: 'Telemetry Count',
      icon: 'fa fa-fw fa-calculator',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    // {
    //   page: 'error',
    //   system_name: 'Error',
    //   url: '#asset_error',
    //   display_name: 'Error',
    //   icon: 'fa fa-fw fa-exclamation-triangle',
    //   visible: true,
    //   isTitle: false,
    //   showAccordion: [],
    //   accordion_value: {}
    // },
    {
      page: 'c2d',
      system_name: 'Control(C2D)',
      url: null,
      display_name: 'Control(C2D)',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'control_widgets',
      system_name: 'Control/Configure',
      url: '#asset_control_widgets',
      display_name: 'Control/Configure',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false,
      showAccordion: [
        { name: 'Configuration', key: 'configuration'},
        { name: 'Control', key: 'control'},
        { name: 'Purge', key: 'purge'}
      ],
      accordion_value: {configuration: true, purge: true, control: true}
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
      url: '#asset_model_overview',
      display_name: 'Overview',
      icon: 'fa fa-fw fa-life-ring',
      visible: true,
      isTitle: false
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#asset_model_tags',
      display_name: 'Tags',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'package_management',
      system_name: 'Software Packages',
      url: '#asset_model_package_management',
      display_name: 'Software Packages',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false
    },
    {
      page: 'settings',
      system_name: 'Setup',
      url: '#asset_model_settings',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false
    },
    {
      page: 'd2c',
      system_name: 'Monitor',
      url: null,
      display_name: 'Monitor',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'slave_info',
      system_name: 'Sensor / Source / Slave Info',
      url: '#asset_model_slave_info',
      display_name: 'Sensor / Source / Slave Info',
      icon: 'fa fa-fw fa-user-secret',
      visible: true,
      isTitle: false
    },
    {
      page: 'measured_properties',
      system_name: 'Measured Properties',
      url: '#asset_model_properties',
      display_name: 'Measured Properties',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false
    },
    {
      page: 'derived_properties',
      system_name: 'Edge Derived Properties',
      url: '#asset_model_properties',
      display_name: 'Edge Derived Properties',
      icon: 'fa fa-fw fa-retweet',
      visible: true,
      isTitle: false
    },
    {
      page: 'controllable_properties',
      system_name: 'Controllable Properties',
      url: '#asset_model_properties',
      display_name: 'Controllable Properties',
      icon: 'fa fa-fw fa-edit',
      visible: true,
      isTitle: false
    },
    {
      page: 'configurable_properties',
      system_name: 'Configurable Properties',
      url: '#asset_model_properties',
      display_name: 'Configurable Properties',
      icon: 'fa fa-fw fa-book',
      visible: true,
      isTitle: false
    },

    {
      page: 'alert_conditioning',
      system_name: 'Alert Conditioning',
      url: '#asset_model_alert_conditioning',
      display_name: 'Alert Conditioning',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    {
      page: 'c2d',
      system_name: 'Control',
      url: null,
      display_name: 'Control',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'direct_methods',
      system_name: 'Direct Methods',
      url: '#asset_model_methods',
      display_name: 'Direct Methods',
      icon: 'fa fa-fw fa-archive',
      visible: true,
      isTitle: false
    },
    {
      page: 'configuration_widgets',
      system_name: 'Configuration Widgets',
      url: '#asset_model_configuration_widgets',
      display_name: 'Configuration Widgets',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false
    },
    {
      page: 'control_widgets',
      system_name: 'Control Widgets',
      url: '#asset_model_control_widgets',
      display_name: 'Control Widgets',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false
    },
    {
      page: 'compute',
      system_name: 'Compute',
      url: null,
      display_name: 'Compute',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'stream_processing',
      system_name: 'Cloud Derived Properties',
      url: '#asset_model_stream_processing',
      display_name: 'Cloud Derived Properties',
      icon: 'fa fa-fw fa-microchip',
      visible: true,
      isTitle: false
    },
    {
      page: 'derived_kpis',
      system_name: 'Derived KPIs',
      url: '#asset_model_derived_kpis',
      display_name: 'Derived KPIs',
      icon: 'fa fa-fw fa-retweet',
      visible: true,
      isTitle: false
    },
    {
      page: 'rules',
      system_name: 'Rules',
      url: '#asset_model_rules',
      display_name: 'Rules',
      icon: 'fa fa-fw fa-archive',
      visible: true,
      isTitle: false
    },
    // {
    //   page: 'addrules',
    //   system_name: 'addRules',
    //   url: '#asset_model_add_rules',
    //   display_name: 'AddRules',
    //   icon: 'fa fa-fw fa-archive',
    //   visible: true,
    //   isTitle: false
    // },
    {
      page: 'visualization',
      system_name: 'Visualize',
      url: 'null',
      display_name: 'Visualize',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'layout',
      system_name: 'Visualization Widgets',
      url: '#asset_model_layout',
      display_name: 'Visualization Widgets',
      icon: 'fa fa-fw fa-bar-chart',
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
      url: '#asset_model_reference_material',
      display_name: 'Documents',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false
    },
    {
      page: 'alert_acknowledgement_reasons',
      system_name: 'Alert Acknowledgement Reasons',
      url: '#asset_model_alert_acknowledgement_reasons',
      display_name: 'Alert Acknowledgement Reasons',
      icon: 'fa fa-fw fa-exclamation-triangle',
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

  public static ASSET_METHODS = [
    'REBOOT',
    'FOTA',
    'TELEMETRY_INTERVAL_CHANGE'
  ];

  public static DATE_OPTIONS = {
    'Last 5 Mins': [moment().subtract(5, 'minutes'), moment()],
    'Last 30 Mins': [moment().subtract(30, 'minutes'), moment()],
    'Last 1 Hour': [moment().subtract(1, 'hour'), moment()],
    'Last 3 Hours': [moment().subtract(3, 'hours'), moment()],
    'Last 6 Hours': [moment().subtract(6, 'hours'), moment()],
    'Last 12 Hours': [moment().subtract(12, 'hours'), moment()],
    'Last 24 Hours': [moment().subtract(24, 'hours'), moment()],
    Today: [moment().startOf('day'), moment()],
    Yesterday: [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
    'This Week': [moment().startOf('week'), moment()],
    'Last Week': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week')],
    // 'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    // 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment()],
    // 'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };
  public static USER_DETAILS = 'userData';
  public static SELECTED_APP_DATA = 'selectedAppData';
  public static DASHBOARD_TELEMETRY_SELECTION = 'dashboardTelemetryFilterObj';
  public static DASHBOARD_ALERT_SELECTION = 'dashboardAlertFilterObj';
  public static ASSETS_LIST = 'assets_list';
  public static ASSETS_GATEWAYS_LIST = 'assets_gateways_list';
  public static ASSET_MODELS_LIST = 'asset_models_list';
  public static ASSET_MODEL_DATA = 'asset_model_data';
  public static ASSET_LIST_FILTER_FOR_GATEWAY = 'assetListFilterObj';
  public static APP_USERS = 'application_users';
  public static EXPIRY_TIME = 'expiry_time';
  public static CURRENT_BREADCRUMB_STATE = 'breadcrumbState';
  public static NON_IP_ASSETS = 'Non IP Assets';
  public static IP_ASSET = 'IoT Asset';
  public static IP_GATEWAY = 'IoT Gateway';
  public static NON_IP_ASSET = 'Legacy Asset';
  public static NOT_ALLOWED_SPECIAL_CHARS_NAME = [' ', '.', '$', '#'];
  public static PASSWORD_REGEX = '^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,20}$';
  public static EMAIL_REGEX = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  public static ONLY_NOS_AND_CHARS = /^[a-zA-Z0-9]+$/;
  public static APP_ADMIN_ROLE = 'App Admin';
  public static APP_VERSION = 'version';
  public static MAIN_MENU_FILTERS = 'main_menu_filter';
  public static CONTROL_PANEL_FILTERS = 'control_panel_filter';
  public static APP_TOKEN = 'app_token';

  // public static DEFAULT_APP_ICON = environment.blobContainerName + '/default_app_icon.png';
  // public static DEFAULT_APP_LOGO = environment.blobContainerName + '/default_app_logo.jpg';
  // public static DEFAULT_HEADER_LOGO = environment.blobContainerName + '/app-media/logo.png';
  // public static DEFAULT_MODEL_IMAGE = environment.blobContainerName + '/asset-model-media/asset.svg';

  public static DEFAULT_APP_ICON = 'rdm-images/default_app_icon.png';
  public static DEFAULT_APP_LOGO = 'rdm-images/default_app_logo.jpg';
  public static DEFAULT_HEADER_LOGO = 'rdm-images/app-images/header-logo/logo.png';
  public static DEFAULT_MODEL_IMAGE = 'rdm-images/asset-model-images/asset.svg';

}
