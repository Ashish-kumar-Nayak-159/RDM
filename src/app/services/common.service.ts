import { SignalRService } from './signalR/signal-r.service';
import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from '../app-url.constants';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import jwt_decode from 'jwt-decode';
import { CONSTANTS } from 'src/app/app.constants';
import { AnonymousCredential, BlobServiceClient, newPipeline } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  url = environment.appServerURL;
  breadcrumbEvent: EventEmitter<any> = new EventEmitter<any>();
  refreshSideMenuData: EventEmitter<any> = new EventEmitter<any>();
  resetPassword: EventEmitter<any> = new EventEmitter<any>();
  flag = false;
  privateEncryptionString = environment.storgageSecretKey;
  constructor(
    private http: HttpClient,
    private router: Router,
    private signalRService: SignalRService
  ) {
  }

  convertUTCDateToLocal(utcDate) {
    if (utcDate) {
      const options = { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit',
      minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3, hour12: true  };
      if (utcDate.includes('T') && utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000Z
        return new Date(utcDate).toLocaleString('en-GB', options);
      } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000
        return new Date(utcDate + 'Z').toLocaleString('en-GB', options);
      } else {
        // 1/20/2021 10:47:59 AM
        return new Date(utcDate + ' UTC').toLocaleString('en-GB', options);
      }
    }
    return null;
  }

  convertUTCDateToLocalDate(utcDate) {
    if (utcDate) {
      const options = { year: 'numeric', month: 'short', day: '2-digit' };
      if (utcDate.includes('T') && utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000Z
        return new Date(utcDate).toLocaleString('en-GB', options);
      } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000
        return new Date(utcDate + 'Z').toLocaleString('en-GB', options);
      } else {
        // 1/20/2021 10:47:59 AM
        return new Date(utcDate + ' UTC').toLocaleString('en-GB', options);
      }
    }
    return null;
  }

  convertDateToEpoch(date: string) {
    if (date) {
      return (moment.utc(date)).unix();
    }
    return 0;
  }

  convertEpochToDate(epoch) {
    if (epoch) {
      return moment.unix(epoch).format('DD-MMM-YYYY hh:mm:ss A');
    }
    return null;
  }

  getFileData(url) {
    return this.http.get(url, {
      responseType: 'blob'
    });
  }

  getFileOriginalData(url) {
    return this.http.get(url);
  }

  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  loginUser(obj) {
    return this.http.post(this.url + AppUrls.LOGIN,  obj);
  }

  decodeJWTToken(token): any {
    if (token) {
      try{
        return jwt_decode(token);
    } catch (e) {
        return null;
    }
    }
  }

  resetUserPassword(obj, app) {
    let params = new HttpParams();
    if (app) {
    params = params.set('app', app);
    }
    return this.http.post(this.url + AppUrls.RESET_PASSWORD,  obj, {params});
  }

  encryptJSON(data) {
    if (data) {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.privateEncryptionString).toString();
    }
  }

  decryptString(key) {
    if (key) {
      try {
        const bytes = CryptoJS.AES.decrypt(key, this.privateEncryptionString);
        if (bytes.toString()) {
          return bytes.toString(CryptoJS.enc.Utf8);
        }
        return key;
      } catch (e) {
        console.log(e);
      }
    }
    return undefined;
  }

  getItemFromLocalStorage(key) {
    const data = this.decryptString(localStorage.getItem(key));
    // const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    return data;
  }

  getToken() {
    return localStorage.getItem(CONSTANTS.APP_TOKEN);
  }

  setItemInLocalStorage(key, value) {
    localStorage.setItem(key, this.encryptJSON(value));
    // localStorage.setItem(key, JSON.stringify(value));
  }

  getMomentStartEndDate(label) {
    const obj: any = {};
    if (label === 'Last 5 Mins') {
      obj.from_date = moment().subtract(5, 'minutes').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 30 Mins') {
      obj.from_date = moment().subtract(30, 'minutes').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 1 Hour') {
      obj.from_date = moment().subtract(1, 'hour').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 3 Hours') {
      obj.from_date = moment().subtract(3, 'hours').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 6 Hours') {
      obj.from_date = moment().subtract(6, 'hours').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 12 Hours') {
      obj.from_date = moment().subtract(12, 'hours').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 24 Hours') {
      obj.from_date = moment().subtract(24, 'hours').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 7 Days') {
      obj.from_date = moment().subtract(6, 'days').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'This Week') {
      obj.from_date = moment().startOf('isoWeek').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last 4 Weeks') {
      obj.from_date = moment().subtract(4, 'weeks').startOf('isoWeek').utc().unix();
      obj.to_date = moment().subtract(1, 'weeks').endOf('isoWeek').utc().unix();
    } else if (label === 'Last 30 Days') {
      obj.from_date = moment().subtract(29, 'days').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'This Month') {
      obj.from_date = moment().startOf('month').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Last Month') {
      obj.from_date = moment().subtract(1, 'month').startOf('month').utc().unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').utc().unix();
    } else if (label === 'Last 3 Months') {
      obj.from_date = moment().subtract(3, 'month').startOf('month').utc().unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').utc().unix();
    } else if (label === 'Last 6 Months') {
      obj.from_date = moment().subtract(6, 'month').startOf('month').utc().unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').utc().unix();
    } else if (label === 'Last 12 Months') {
      obj.from_date = moment().subtract(12, 'month').startOf('month').utc().unix();
      obj.to_date = moment().subtract(1, 'month').endOf('month').utc().unix();
    } else if (label === 'Today') {
      obj.from_date = moment().startOf('day').utc().unix();
      obj.to_date = moment().utc().unix();
    } else if (label === 'Yesterday') {
      obj.from_date = moment().subtract(1, 'days').startOf('day').utc().unix();
      obj.to_date = moment().subtract(1, 'days').endOf('day').utc().unix();
    } else if (label === 'Last Week') {
      obj.from_date = moment().subtract(1, 'week').startOf('week').utc().unix();
      obj.to_date = moment().subtract(1, 'week').endOf('week').utc().unix();
    }
    return obj;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line: no-bitwise
      const r = Math.random() * 16 | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async uploadImageToBlob(file, folderName, containerName = undefined) {
    if (!containerName) {
      containerName = environment.blobContainerName;
    }
    const epoch = moment().utc().unix();
    const fileNameArr = file.name.split('.');
    const fileExtension = fileNameArr[fileNameArr.length - 1];
    fileNameArr.pop();
    const fileName = fileNameArr.join() + '_' + epoch + '.' + fileExtension;
    const pipeline = newPipeline(new AnonymousCredential(), {
    retryOptions: { maxTries: 2 }, // Retry options
    keepAliveOptions: {
        enable: false
    }
    });
    const blobServiceClient = new BlobServiceClient(environment.blobURL +  environment.blobKey, pipeline);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containerClient.exists()){
    await containerClient.create();
    }

    const client = containerClient.getBlockBlobClient(folderName + '/' + fileName);
    const response = await client.uploadBrowserData(file, {
          blockSize: 4 * 1024 * 1024, // 4MB block size
          concurrency: 20, // 20 concurrency
          blobHTTPHeaders : { blobContentType: file.type }
          });
    if (response._response.status === 201) {
      return {
        url:  containerName + '/' + folderName + '/' + fileName,
        name: file.name
      };
    }
    return null;
  }

  randomIntFromInterval(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  averageGeolocation(coords) {
    if (coords.length === 1) {
      return coords[0];
    }
    let x = 0.0;
    let y = 0.0;
    let z = 0.0;
    let total = 0;
    for (const coord of coords) {
      if (coord.latitude && coord.longitude) {
        total = total + 1;
        const latitude = coord.latitude * Math.PI / 180;
        const longitude = coord.longitude * Math.PI / 180;
        x += Math.cos(latitude) * Math.cos(longitude);
        y += Math.cos(latitude) * Math.sin(longitude);
        z += Math.sin(latitude);
      }
    }
    x = x / total;
    y = y / total;
    z = z / total;
    const centralLongitude = Math.atan2(y, x);
    const centralSquareRoot = Math.sqrt(x * x + y * y);
    const centralLatitude = Math.atan2(z, centralSquareRoot);
    return {
      latitude: centralLatitude * 180 / Math.PI,
      longitude: centralLongitude * 180 / Math.PI
    };
  }

  calculateEstimatedRecords(frequency, startTime, endTime) {
    const time = endTime - startTime;
    return Math.round(time / frequency);
  }

  onLogOut() {
    // const now = new Date();
    // // compare the expiry time of the item with the current time
    // const expiryObj: any = localStorage.getItem(CONSTANTS.EXPIRY_TIME);
    // if (!expiryObj || now.getTime() > expiryObj.expired_at) {
    //   localStorage.clear();
    // } else {
    //   localStorage.removeItem(CONSTANTS.USER_DETAILS);
    // }
    localStorage.clear();
    this.signalRService.disconnectFromSignalR('all');
    this.router.navigate(['']).then(() => {
      location.reload();
    });

  }
}
