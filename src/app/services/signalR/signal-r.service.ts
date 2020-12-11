import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import * as SignalR from '@aspnet/signalr';
import { AppUrls } from 'src/app/app-url.constants';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  signalRURL = environment.appServerURL + AppUrls.SIGNALR_NEGOTIATE;
  telemetryConnections: SignalR.HubConnection[] = [];
  alertConnections: SignalR.HubConnection[] = [];
  alertOverlayConnections: SignalR.HubConnection[] = [];
  signalRTelemetryData: EventEmitter<any> = new EventEmitter<any>();
  signalRAlertData: EventEmitter<any> = new EventEmitter<any>();
  signalROverlayAlertData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient
  ) { }

  connectToSignalR(connectionObj, type = '') {
    let connection;
    this.http.post<any>(this.signalRURL, connectionObj)
    .subscribe(con => {
        // con object have access token and url
        const options: signalR.IHttpConnectionOptions = {
          accessTokenFactory: () => con.accessToken
        };
        // this lines will create an HubConnectionBuilder object which will used to start and stop connection
        connection = new SignalR.HubConnectionBuilder()
        .withUrl(con.url, options)
        .configureLogging(SignalR.LogLevel.Information)
        .build();

        connection.start().then(() => {
          connection.on('notify', data => {
            console.log(data);
            if (connectionObj.type === 'telemetry') {
              this.signalRTelemetryData.emit(JSON.parse(data));
            } else if (connectionObj.type === 'alert' && type === '') {
              this.signalRAlertData.emit(JSON.parse(data));
            } else if (connectionObj.type === 'alert' && type === 'overlay') {
              this.signalROverlayAlertData.emit(JSON.parse(data));
            }
          });
          if (connectionObj.type === 'telemetry') {
            this.telemetryConnections.push(connection);
          } else if (connectionObj.type === 'alert'  && type === '') {
            this.alertConnections.push(connection);
          } else if (connectionObj.type === 'alert'  && type === 'overlay') {
            this.alertOverlayConnections.push(connection);
          }
        });
    });
  }

  disconnectFromSignalR(type = 'all') {
    if (type === 'telemetry' || type === 'all') {
      let arr = [];
      arr = [...this.telemetryConnections];
      arr.forEach((connection, i) => {
        console.log(connection);
        if (connection.connectionState === 1) {
          connection.stop();
          this.telemetryConnections.splice(i, 1);
        }
      });
    }
    if (type === 'alert' || type === 'all') {
      let arr = [];
      arr = [...this.alertConnections];
      arr.forEach((connection, i) => {
        if (connection.connectionState === 1) {
          connection.stop();
          this.alertConnections.splice(i, 1);
        }
      });
    }
    if (type === 'overlay' || type === 'all') {
      let arr = [];
      arr = [...this.alertOverlayConnections];
      arr.forEach((connection, i) => {
        if (connection.connectionState === 1) {
          connection.stop();
          this.alertOverlayConnections.splice(i, 1);
        }
      });
    }
  }
}
