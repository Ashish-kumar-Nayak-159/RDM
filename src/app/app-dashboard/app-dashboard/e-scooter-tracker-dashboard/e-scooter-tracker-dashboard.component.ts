
import { DeviceService } from 'src/app/services/devices/device.service';
import { Component, OnInit, OnDestroy, AfterViewInit, ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef, Injector, Input } from '@angular/core';
import { GoogleChartInterface } from 'ng2-google-charts';
import { Router, ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/app.constants';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common.service';
import { DeviceTypeService } from 'src/app/services/device-type/device-type.service';
import { constants } from 'http2';

@Component({
  selector: 'app-e-scooter-tracker-dashboard',
  templateUrl: './e-scooter-tracker-dashboard.component.html',
  styleUrls: ['./e-scooter-tracker-dashboard.component.css']
})
export class EScooterTrackerDashboardComponent implements OnInit, OnDestroy {

  devices: any[] = [];
  appName: string;
  userData: any;
  properties: any[] = [];
  @Input() tileData: any;
  gaugeGoogleChartConfig: GoogleChartInterface = {
    chartType: 'Gauge',
    dataTable: [
      ['Label', 'Value']
    ],
    options: {
      redFrom: 90, redTo: 100,
      yellowFrom: 75, yellowTo: 90,
      minorTicks: 5,
      height: 180,
    }
  };
  lineGoogleChartConfig: GoogleChartInterface = {  // use :any or :GoogleChartInterface
    chartType: 'LineChart',
    dataTable: [],
    options: {
      interpolateNulls: true,
      hAxis: {
        viewWindowMode: 'pretty',
        slantedText: true,
        textStyle: {
          fontSize: 10
        },
        slantedTextAngle: 60
      },
      legend: {
        position: 'top'
      },
      series: {
      },
      vAxes: {
          // Adds titles to each axis.
        },
      height: 300,
      width: 800,
      curveType: 'function',
      explorer: {
        actions: ['dragToZoom', 'rightClickToReset'],
        axis: 'horizontal',
        keepInBounds: true,
        maxZoomIn: 10.0}
    }
  };
  apiLoaded;
  chartDataRefreshInterval: any;
  chartData: any = {};
  zoom = 13;
  center: google.maps.LatLngLiteral;
  markers: any[] = [];
  markerOptions: google.maps.MarkerOptions;
  @Input() contextApp: any;
  apiSubscriptions: Subscription[] = [];
  constructor(
    private deviceService: DeviceService,
    private route: ActivatedRoute,
    private commonService: CommonService,
    private deviceTypeService: DeviceTypeService,
    private factoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    httpClient: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.route.paramMap.subscribe(params => {
      this.appName = params.get('applicationId');
      this.getDevices();
    });
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: 23.04066,
        lng: 72.52808,
      };
    });

    this.markers.push({
      position: {
        lat: 23.03842,
        lng: 72.56235,
      },
      label: {
        color: 'red',
        text: null
      },
      title: 'Location-1',
      // options: { animation: google.maps.Animation.BOUNCE },
    });
    this.markers.push({
      position: {
        lat: 23.04141,
        lng: 72.49365
      },
      label: {
        color: 'red',
        text: null
      },
      title: 'Location-2',
      // options: { animation: google.maps.Animation.BOUNCE },
    });

  }

  click(event: google.maps.MouseEvent) {
    console.log(event);
  }

  getDevices() {
    this.devices = [];
    const obj = {
      app: this.appName
    };
    this.apiSubscriptions.push(this.deviceService.getDeviceList(obj).subscribe(
      async (response: any) => {
        if (response && response.data) {
          this.devices = response.data;
          await this.getThingsModelProperties();
          const arr = [];
          this.chartData = {};
          this.devices.forEach(device => {
            const filterObj = {
              epoch: true,
              app: this.appName,
              device_id: device.device_id,
              count: 1,
              from_date: null,
              to_date: null,
              message_props: 'speed,battery_level,gps_coordinates,direction',
            };
            const now =  moment().utc();
            filterObj.from_date = (now.subtract(5, 'seconds')).unix();
            filterObj.to_date = now.unix();
            this.chartData[device.device_id] = null;
            // this.properties.forEach((prop, index) => filterObj.message_props += prop.json_key +
            //   (index !== (this.properties.length - 1) ? ',' : ''));
            arr.push(this.getLastTelemetry(filterObj));
          });
          await Promise.all(arr);
          this.loadGaugeChart(this.chartData);
          this.loadLineChart(this.chartData, '');
          this.setMarkers(this.chartData, 'add');
          this.chartDataRefreshInterval = setInterval(async () => {
            this.devices.forEach(device => {
              const filterObj = {
                epoch: true,
                app: this.appName,
                device_id: device.device_id,
                count: 1,
                message_props: 'speed,battery_level,gps_coordinates,direction',
              };

              arr.push(this.getLastTelemetry(filterObj));
            });
            await Promise.all(arr);
            this.gaugeGoogleChartConfig.dataTable = [];
            this.gaugeGoogleChartConfig.dataTable.push(['Label', 'Value']);
            this.loadGaugeChart(this.chartData);
            this.loadLineChart(this.chartData, 'live');
            this.setMarkers(this.chartData, 'update');
          }, 4500);
        }
      }, errror => {}
    ));
  }

  getThingsModelProperties() {
    // this.properties = {};
    return new Promise((resolve, reject) => {
      const obj = {
        app: this.appName,
        name: this.devices[0].tags.device_type
      };
      this.apiSubscriptions.push(this.deviceTypeService.getThingsModelProperties(obj).subscribe(
        (response: any) => {
          this.properties = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.derived_properties = response.properties.derived_properties ? response.properties.derived_properties : [];
          response.properties.derived_properties.forEach(prop => this.properties.push(prop));
          resolve();
        }
      ));
    });
  }

  getLastTelemetry(obj) {
    return new Promise((resolve, reject) =>
    this.apiSubscriptions.push(this.deviceService.getDeviceTelemetry
    (obj).subscribe((response: any) => {
      if (response?.data) {
        this.chartData[obj.device_id] = response.data;
      }
      resolve();
    })));
  }

  setMarkers(telemetryData, type) {
    const keys = Object.keys(telemetryData);
    if (type === 'update') {
      keys.forEach(key => {
        if (telemetryData[key][0]?.gps_coordinates?.length > 0) {
          const data = JSON.parse(telemetryData[key][0]?.gps_coordinates);
          this.markers.forEach(marker => {
            if (marker.title === key) {
              marker.position =  {
                lat: parseFloat(data[1]),
                lng: parseFloat(data[0])
              };
            }
          });
        }
      });
    } else if (type === 'add') {
      keys.forEach(key => {
        if (telemetryData[key][0]?.gps_coordinates?.length > 0) {
          const data = JSON.parse(telemetryData[key][0]?.gps_coordinates);
          this.markers.push({
            position: {
              lat: parseFloat(data[1]),
              lng: parseFloat(data[0])
            },
            label: {
              color: 'black',
              text: null
            },
            title: key,
            options: {
              icon: {
                url: telemetryData[key][0]?.direction === 'DOWN' ? '../../../../../assets/img/scooter-forward.svg' :
                '../../../../../assets/img/scooter-reverse.svg',
                scaledSize: {
                  width: 30,
                  height: 30
                }
              }
            }
          });
        }
      });
    }
  }

  loadLineChart(telemetryData, type) {
    const keys = Object.keys(telemetryData);
    if (type !== 'live') {
      const dataList = [];
      dataList.push('DateTime');
      let title = '';

      keys.forEach((key, index) => {
        dataList.splice(dataList.length, 0,  {label: key, type: 'number'});
        title += key + (keys[index + 1] ? ' & ' : '');
        this.lineGoogleChartConfig.options.series[Object.keys(this.lineGoogleChartConfig.options.series).length] = {targetAxisIndex: 0};
      });
      this.lineGoogleChartConfig.options.vAxes = {
        0: {title}
      };
      this.lineGoogleChartConfig.dataTable.push(dataList);
    }

    const list = [];
    let date = '';
    const value = [];
    Object.keys(telemetryData).forEach(key => {
      if (telemetryData[key].length > 0) {
        if (date === '') {
          date = this.commonService.convertUTCDateToLocal(telemetryData[key][0].message_date);
        }
        value.push(telemetryData[key][0].speed);
      } else {
        value.push(null);
      }
    });
    list.splice(0, 0, date);
    value.forEach(val => list.splice(list.length, 0, parseFloat(val)));
    this.lineGoogleChartConfig.dataTable.splice(this.lineGoogleChartConfig.dataTable.length, 0, list);
    if (this.lineGoogleChartConfig.dataTable.length === 10) {
      this.lineGoogleChartConfig.dataTable.splice(1, 1);
    }

    if (this.lineGoogleChartConfig.dataTable.length > 1) {
    const ccComponent = this.lineGoogleChartConfig.component;
    // force a redraw
    if (ccComponent) {
      ccComponent.draw();
    }
    }
  }

  loadGaugeChart(telemetryData) {
    if (telemetryData) {
      // this.gaugeGoogleChartConfig.dataTable = [];
      // this.gaugeGoogleChartConfig.dataTable.push(['Label', 'Value']);
      Object.keys(telemetryData).forEach(key => {
        const list = [];
        list.push(key);
        if (telemetryData[key].length > 0) {
          list.push(parseFloat(telemetryData[key][0].speed));
        } else {
          list.push(null);
        }
        this.gaugeGoogleChartConfig.dataTable.splice(this.gaugeGoogleChartConfig.dataTable.length, 0, list);
      });
      const component = this.gaugeGoogleChartConfig.component;
      if (component) {
        component.draw();
      }
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.chartDataRefreshInterval);
    this.apiSubscriptions.forEach(sub => sub.unsubscribe());
  }



}
