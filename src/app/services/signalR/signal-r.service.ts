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
  connections: SignalR.HubConnection[] = [];
  signalRTelemetryData: EventEmitter<any> = new EventEmitter<any>();
  signalRAlertData: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    private http: HttpClient
  ) { }

  connectToSignalR(connectionObj) {
    let connection: SignalR.HubConnection;
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
            } else if (connectionObj.type === 'alert') {
              this.signalRAlertData.emit(JSON.parse(data));
            }
          });
          this.connections.push(connection);
        });
    });
  }

  disconnectFromSignalR() {
    this.connections.forEach(connection => {
      if (connection.state === 1) {
        connection.stop();
      }
    });
  }
}
