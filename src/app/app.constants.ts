import { environment } from 'src/environments/environment';

export class CONSTANTS {

  // device tags list based on device protocol
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
      connectivity: ['BLE Asset -> Mobile App -> Azure IOT Hub SDK -> Cloud', 'BLE Asset -> Mobile App -> MQTT Client -> Cloud',
    'BLE Asset -> Gateway -> Azure IOT Hub SDK -> Cloud', 'BLE Asset -> Gateway -> MQTT Client -> Cloud'],
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
      connectivity: ['ModBus Asset -> IoT Gateway -> Azure IoT Hub SDK -> Azure Cloud'],
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
      name: 'PLC',
      connectivity: ['PLC Protocol -> IoT Gateway -> Azure IoT Hub SDK -> Azure Cloud'],
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
      icon: 'fa fa-fw fa-home',
      visible: true,
      showAccordion: [],
      priority: 1
    },
    {
      page: 'Dashboard',
      system_name: 'Dashboard',
      url: 'applications/:appName/dashboard',
      display_name: 'Dashboard',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Dashboard'},
      ],
      priority: 1
    },
    {
      page: 'Assets',
      system_name: 'IoT Assets',
      url: 'applications/:appName/devices',
      display_name: 'IoT Assets',
      icon: 'fa fa-fw fa-desktop',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Assets'},
        { name: 'Table Key Name', value: 'Asset'},
        { name: 'Records Limit', value: 20, type: 'number'},
      ],
      priority: 1
    },
    {
      page: 'Non IP Assets',
      system_name: 'Legacy Assets',
      url: 'applications/:appName/nonIPDevices',
      display_name: 'Legacy Assets',
      icon: 'fa fa-fw fa-folder',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Assets'},
        { name: 'Table Key Name', value: 'Asset'},
        { name: 'Records Limit', value: 20, type: 'number'},
      ],
      priority: 1
    },
    {
      page: 'Things Modelling',
      system_name: 'Things Modelling',
      url: 'applications/:appName/things/model',
      display_name: 'Asset Modelling',
      icon: 'fa fa-fw fa-list',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Models'},
        { name: 'Table Key Name', value: 'Model'}
      ],
      priority: 1
    },
    {
      page: 'Asset Groups',
      system_name: 'Asset Groups',
      url: null,
      display_name: 'Asset Groups',
      icon: 'fa fa-fw fa-table',
      visible: true,
      children: [
        {
          page: 'Group Jobs',
          system_name: 'Group Jobs',
          url: null,
          display_name: 'Group Jobs',
          visible: true,
          showAccordion: []
        },
        {
          page: 'Group Type',
          system_name: 'Group Type',
          url: null,
          display_name: 'Group Type',
          visible: true,
          showAccordion: []
        }
      ],
      priority: 1
    },
    {
      page: 'Alert Visualization',
      system_name: 'Alert Visualization',
      url: 'applications/:appName/data/visualization',
      display_name: 'Alert Visualization',
      icon: 'fa fa-fw fa-bar-chart',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Alerts'},
      ],
      priority: 1
    },
    {
      page: 'Reports',
      system_name: 'Reports',
      url: 'applications/:appName/reports',
      display_name: 'Reports',
      icon: 'fa fa-fw fa-file',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Reports'},
        { name: 'Records Limit', value: 100, type: 'number'}
      ],
      priority: 1
    },
    {
      page: 'Assets Management',
      system_name: 'Assets Management',
      url: 'applications/:appName/asset/management',
      display_name: 'Assets Management',
      icon: 'fa fa-fw fa-cog',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Assets Management'}
      ],
      priority: 1
    },
    {
      page: 'Gateways',
      system_name: 'IoT Gateways',
      url: 'applications/:appName/gateways',
      display_name: 'IoT Gateways',
      icon: 'fa fa-fw fa-desktop',
      visible: true,
      showAccordion: [
        { name: 'Title', value: 'Gateways'},
        { name: 'Table Key Name', value: 'Gateway'},
        { name: 'Records Limit', value: 20, type: 'number'},
      ],
      priority: 2
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
      accordion_value: {}
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
      icon: 'fa fa-fw fa-stack-exchange',
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
      accordion_value: {}
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
      page: 'maintenance',
      system_name: 'Maintenance',
      url: null,
      display_name: 'Maintenance',
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
      accordion_value: {}
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
      icon: 'fa fa-fw fa-stack-exchange',
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
      accordion_value: {}
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
      page: 'maintenance',
      system_name: 'Maintenance',
      url: null,
      display_name: 'Maintenance',
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
      accordion_value: {}
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
      icon: 'fa fa-fw fa-stack-exchange',
      visible: true,
      isTitle: false,
      showAccordion: [],
      accordion_value: {}
    },
    {
      page: 'count',
      system_name: 'Count',
      url: '#device_count',
      display_name: 'Count',
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
      accordion_value: {}
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
      icon: 'fa fa-fw fa-pencil-square-o',
      visible: true,
      isTitle: false
    },
    {
      page: 'device_methods',
      system_name: 'Device Methods',
      url: '#device_type_methods',
      display_name: 'Device Methods',
      icon: 'fa fa-fw fa-archive',
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
      page: 'd2c',
      system_name: 'D2C (Monitor)',
      url: null,
      display_name: 'D2C (Monitor)',
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
      page: 'c2d',
      system_name: 'C2D (Control)',
      url: null,
      display_name: 'C2D (Control)',
      icon: null,
      visible: true,
      isTitle: true
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


  // public static DEFAULT_APP_ICON = environment.blobContainerName + '/default_app_icon.png';
  // public static DEFAULT_APP_LOGO = environment.blobContainerName + '/default_app_logo.jpg';
  // public static DEFAULT_HEADER_LOGO = environment.blobContainerName + '/app-media/logo.png';
  // public static DEFAULT_MODEL_IMAGE = environment.blobContainerName + '/device-type-media/device.svg';

  public static DEFAULT_APP_ICON = 'rdm-images/default_app_icon.png';
  public static DEFAULT_APP_LOGO = 'rdm-images/default_app_logo.jpg';
  public static DEFAULT_HEADER_LOGO = 'rdm-images/app-images/header-logo/logo.png';
  public static DEFAULT_MODEL_IMAGE = 'rdm-images/device-type-images/device.svg';

}
