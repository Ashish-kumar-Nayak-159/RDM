import * as moment from 'moment';
import { environment } from 'src/environments/environment';

export class CONSTANTS {

  public static DEVICEAPPPS = [
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
    is_update: true, display_name: 'Siemens TCP/IP App', metadata: {}, deleted: false, type: 'apps'}
  ];

  public static PROTOCOLS = [
    {id: 1, asset_type: 'IoT Device', name: 'IP Device (WiFi)', display_name: 'IP Device (WiFi)', cloud_connectivity: ['IP Device -> Azure IOT Hub SDK -> WiFi -> Cloud', 'IP Device -> MQTT Client -> WiFi -> Cloud'], metadata: {}, deleted: false},
    {id: 2, asset_type: 'IoT Device', name: 'IP Device (SIM)', display_name: 'IP Device (SIM)', cloud_connectivity: ['IP Device -> Azure IOT Hub SDK -> SIM -> Cloud', 'IP Device -> MQTT Client -> SIM -> Cloud'], metadata: {}, deleted: false},
    {id: 3, asset_type: 'IoT Gateway', name: 'IP Gateway (WiFi)', display_name: 'IP Gateway (WiFi)', cloud_connectivity: ['IP Gateway -> Azure IOT Hub SDK -> WiFi -> Cloud', 'IP Gateway -> MQTT Client -> WiFi -> Cloud'], metadata: {}, deleted: false},
    {id: 4, asset_type: 'IoT Gateway', name: 'IP Gateway (SIM)', display_name: 'IP Gateway (SIM)', cloud_connectivity: ['IP Gateway -> Azure IOT Hub SDK -> SIM -> Cloud', 'IP Gateway -> MQTT Client -> SIM -> Cloud'], metadata: {}, deleted: false},
    {id: 5, asset_type: 'Legacy Device', name: 'ModbusTCPMaster', display_name: 'Modbus TCP', cloud_connectivity: ['ModBus TCP Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'ModbusTCPMaster'}, deleted: false},
    {id: 6, asset_type: 'Legacy Device', name: 'ModbusRTUMaster', display_name: 'Modbus RTU', cloud_connectivity: ['ModBus RTU Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'ModbusRTUMaster'}, deleted: false},
    {id: 7, asset_type: 'Legacy Device', name: 'SiemensTCPIP', display_name: 'Siemens TCP/IP', cloud_connectivity: ['Siemens TCP/IP Asset -> IoT Gateway -> Azure IoT Hub SDK -> Cloud'], metadata: {app: 'SiemensTCPIP'}, deleted: false}
  ];

  public static NON_IP_DEVICE_OPTIONS = [
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
      showAccordion: [],
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
      url: 'applications/:appName/devices',
      display_name: 'Assets',
      exactMatch: false,
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
      exactMatch: true,
      icon: 'fa fa-fw fa-cogs',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Asset Management'}
      ],
      priority: 1
    },
    {
      page: 'Things Models',
      system_name: 'Things Models',
      url: 'applications/:appName/things/model',
      display_name: 'Asset Models',
      exactMatch: false,
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
      page: 'campaigns',
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
      url: '#device_access_control',
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
      url: '#device_tags',
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
      page: 'settings',
      system_name: 'Setup',
      url: '#device_settings',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      icon: 'fa fa-fw fa-heartbeat',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#device_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alerts',
      system_name: 'Alerts',
      url: '#device_alerts',
      display_name: 'Alerts',
      icon: 'fa fa-fw fa-bolt',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alertendevents',
      system_name: 'Alert End Events',
      url: '#device_alert_end_events',
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
      url: '#device_telemetry',
      display_name: 'Telemetry',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'error',
      system_name: 'Error',
      url: '#device_error',
      display_name: 'Error',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'battery_message',
      system_name: 'Battery',
      url: '#device_battery_message',
      display_name: 'Battery',
      icon: 'fa fa-fw fa-battery-full',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'logs',
      system_name: 'Logs',
      url: '#device_logs',
      display_name: 'Logs',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'other',
      system_name: 'Other',
      url: '#device_other',
      display_name: 'Other',
      icon: 'fa fa-fw fa-globe',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      system_name: 'Control / Configure',
      url: '#device_control_widgets',
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
      url: '#device_trend_analysis',
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
      url: '#device_alert_visualization',
      display_name: 'Alert Visualization',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintain',
      system_name: 'Predict',
      url: null,
      display_name: 'Predict',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'mttr',
      system_name: 'TTR',
      url: '#device_mttr',
      display_name: 'TTR',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'mtbf',
      system_name: 'TBF',
      url: '#device_mtbf',
      display_name: 'TBF',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    }
  ];

  public static LEGACY_DEVICE_CONTROL_PANEL_SIDE_MENU_LIST = [
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
      url: '#device_access_control',
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
      url: '#device_tags',
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
      page: 'settings',
      system_name: 'Settings',
      url: '#device_settings',
      display_name: 'Settings',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      icon: 'fa fa-fw fa-heartbeat',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'notifications',
      system_name: 'Notifications',
      url: '#device_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alerts',
      system_name: 'Alerts',
      url: '#device_alerts',
      display_name: 'Alerts',
      icon: 'fa fa-fw fa-bolt',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'alertendevents',
      system_name: 'Alert End Events',
      url: '#device_alert_end_events',
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
      url: '#device_telemetry',
      display_name: 'Telemetry',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'error',
      system_name: 'Error',
      url: '#device_error',
      display_name: 'Error',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'battery_message',
      system_name: 'Battery',
      url: '#device_battery_message',
      display_name: 'Battery',
      icon: 'fa fa-fw fa-battery-full',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'logs',
      system_name: 'Logs',
      url: '#device_logs',
      display_name: 'Logs',
      icon: 'fa fa-fw fa-file',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'other',
      system_name: 'Other',
      url: '#device_other',
      display_name: 'Other',
      icon: 'fa fa-fw fa-globe',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      system_name: 'Control / Configure',
      url: '#device_control_widgets',
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
      url: '#device_trend_analysis',
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
      url: '#device_alert_visualization',
      display_name: 'Alert Visualization',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'maintain',
      system_name: 'Predict',
      url: null,
      display_name: 'Predict',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'mttr',
      system_name: 'TTR',
      url: '#device_mttr',
      display_name: 'TTR',
      icon: 'fa fa-fw fa-wrench',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'mtbf',
      system_name: 'TBF',
      url: '#device_mtbf',
      display_name: 'TBF',
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
      url: '#device_overview',
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
      url: '#device_tags',
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
      page: 'setup',
      system_name: 'Setup',
      url: '#device_settings',
      display_name: 'Setup',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      page: 'current_config',
      system_name: 'Current Configuration',
      url: '#device_current_config',
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
      url: '#device_config_history',
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
      url: '#device_notifications',
      display_name: 'Notifications',
      icon: 'fa fa-fw fa-bell',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'device_life_cycle',
      system_name: 'Gateway Life Cycle Events',
      url: '#device_life_cycle_events',
      display_name: 'Gateway Life Cycle Events',
      icon: 'fa fa-fw fa-heartbeat',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'cached_alerts',
      system_name: 'Cached Alerts',
      url: '#device_cached_alerts',
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
      url: '#device_cached_telemetry',
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
      url: '#device_count',
      display_name: 'Telemetry Count',
      icon: 'fa fa-fw fa-calculator',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'error',
      system_name: 'Error',
      url: '#device_error',
      display_name: 'Error',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
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
      url: '#device_type_overview',
      display_name: 'Overview',
      icon: 'fa fa-fw fa-life-ring',
      visible: true,
      isTitle: false
    },
    {
      page: 'tags',
      system_name: 'Tags',
      url: '#device_type_tags',
      display_name: 'Tags',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'settings',
      system_name: 'Settings',
      url: '#device_type_settings',
      display_name: 'Settings',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false
    },
    {
      page: 'package_management',
      system_name: 'Package Management',
      url: '#device_type_package_management',
      display_name: 'Package Management',
      icon: 'fa fa-fw fa-tags',
      visible: true,
      isTitle: false
    },
    {
      page: 'capabilities',
      system_name: 'Edge Capabilities',
      url: null,
      display_name: 'Edge Capabilities',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'measured_properties',
      system_name: 'Measured Properties',
      url: '#device_type_properties',
      display_name: 'Measured Properties',
      icon: 'fa fa-fw fa-history',
      visible: true,
      isTitle: false
    },
    {
      page: 'derived_properties',
      system_name: 'Derived Properties',
      url: '#device_type_properties',
      display_name: 'Derived Properties',
      icon: 'fa fa-fw fa-retweet',
      visible: true,
      isTitle: false
    },
    {
      page: 'readable_properties',
      system_name: 'Readable Properties',
      url: '#device_type_properties',
      display_name: 'Readable Properties',
      icon: 'fa fa-fw fa-book',
      visible: true,
      isTitle: false
    },
    {
      page: 'writable_properties',
      system_name: 'Writable Properties',
      url: '#device_type_properties',
      display_name: 'Writable Properties',
      icon: 'fa fa-fw fa-edit',
      visible: true,
      isTitle: false
    },
    {
      page: 'edge_rules',
      system_name: 'Edge Rules',
      url: '#device_type_edge_rules',
      display_name: 'Edge Rules',
      icon: 'fa fa-fw fa-archive',
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
      page: 'alert_conditioning',
      system_name: 'Alert Conditioning',
      url: '#device_type_alert_conditioning',
      display_name: 'Alert Conditioning',
      icon: 'fa fa-fw fa-exclamation-triangle',
      visible: true,
      isTitle: false
    },
    {
      page: 'cloud-capabilities',
      system_name: 'Cloud Capabilities',
      url: null,
      display_name: 'Cloud Capabilities',
      icon: null,
      visible: true,
      isTitle: true
    },
    {
      page: 'stream_processing',
      system_name: 'Stream Processing',
      url: '#device_type_stream_processing',
      display_name: 'Stream Processing',
      icon: 'fa fa-fw fa-microchip',
      visible: true,
      isTitle: false
    },
    {
      page: 'derived_kpis',
      system_name: 'Derived KPIs',
      url: '#device_type_derived_kpis',
      display_name: 'Derived KPIs',
      icon: 'fa fa-fw fa-retweet',
      visible: true,
      isTitle: false
    },
    {
      page: 'cloud_rules',
      system_name: 'Cloud Rules',
      url: '#device_type_cloud_rules',
      display_name: 'Cloud Rules',
      icon: 'fa fa-fw fa-archive',
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
      url: '#device_type_methods',
      display_name: 'Direct Methods',
      icon: 'fa fa-fw fa-archive',
      visible: true,
      isTitle: false
    },
    {
      page: 'configuration_widgets',
      system_name: 'Configuration Widgets',
      url: '#device_type_configuration_widgets',
      display_name: 'Configuration Widgets',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      isTitle: false
    },
    {
      page: 'control_widgets',
      system_name: 'Control Widgets',
      url: '#device_type_control_widgets',
      display_name: 'Control Widgets',
      icon: 'fa fa-fw fa-angle-right',
      visible: true,
      isTitle: false
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
      page: 'layout',
      system_name: 'Widgets',
      url: '#device_type_layout',
      display_name: 'Widgets',
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
      url: '#device_type_reference_material',
      display_name: 'Documents',
      icon: 'fa fa-fw fa-file',
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

  public static DATE_OPTIONS = {
    'Last 5 Mins': [moment().subtract(5, 'minutes'), moment()],
    'Last 30 Mins': [moment().subtract(30, 'minutes'), moment()],
    'Last 1 Hour': [moment().subtract(1, 'hour'), moment()],
    'Last 3 Hours': [moment().subtract(3, 'hours'), moment()],
    'Last 6 Hours': [moment().subtract(6, 'hours'), moment()],
    'Last 12 Hours': [moment().subtract(12, 'hours'), moment()],
    'Last 24 Hours': [moment().subtract(24, 'hours'), moment()],
    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  };
  public static USER_DETAILS = 'userData';
  public static SELECTED_APP_DATA = 'selectedAppData';
  public static DASHBOARD_TELEMETRY_SELECTION = 'dashboardTelemetryFilterObj';
  public static DASHBOARD_ALERT_SELECTION = 'dashboardAlertFilterObj';
  public static DEVICES_LIST = 'devices_list';
  public static DEVICES_GATEWAYS_LIST = 'devices_gateways_list';
  public static DEVICE_MODELS_LIST = 'device_models_list';
  public static DEVICE_MODEL_DATA = 'device_model_data';
  public static DEVICE_LIST_FILTER_FOR_GATEWAY = 'deviceListFilterObj';
  public static APP_USERS = 'application_users';
  public static EXPIRY_TIME = 'expiry_time';
  public static CURRENT_BREADCRUMB_STATE = 'breadcrumbState';
  public static NON_IP_DEVICES = 'Non IP Devices';
  public static IP_DEVICE = 'IoT Device';
  public static IP_GATEWAY = 'IoT Gateway';
  public static NON_IP_DEVICE = 'Legacy Device';
  public static NOT_ALLOWED_SPECIAL_CHARS_NAME = [' ', '.', '$', '#'];
  public static PASSWORD_REGEX = '^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8,20}$';
  public static EMAIL_REGEX = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  public static ONLY_NOS_AND_CHARS = /^[a-zA-Z0-9]+$/;
  public static APP_ADMIN_ROLE = 'App Admin';
  public static APP_VERSION = 'version';
  public static MAIN_MENU_FILTERS = 'main_menu_filter';
  public static CONTROL_PANEL_FILTERS = 'control_panel_filter';

  // public static DEFAULT_APP_ICON = environment.blobContainerName + '/default_app_icon.png';
  // public static DEFAULT_APP_LOGO = environment.blobContainerName + '/default_app_logo.jpg';
  // public static DEFAULT_HEADER_LOGO = environment.blobContainerName + '/app-media/logo.png';
  // public static DEFAULT_MODEL_IMAGE = environment.blobContainerName + '/device-type-media/device.svg';

  public static DEFAULT_APP_ICON = 'rdm-images/default_app_icon.png';
  public static DEFAULT_APP_LOGO = 'rdm-images/default_app_logo.jpg';
  public static DEFAULT_HEADER_LOGO = 'rdm-images/app-images/header-logo/logo.png';
  public static DEFAULT_MODEL_IMAGE = 'rdm-images/device-type-images/device.svg';

}
