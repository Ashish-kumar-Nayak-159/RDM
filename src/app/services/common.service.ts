import { SignalRService } from './signalR/signal-r.service';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppUrls } from 'src/app/constants/app-url.constants';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import jwt_decode from 'jwt-decode';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { AnonymousCredential, BlobServiceClient, newPipeline } from '@azure/storage-blob';
import * as datefns from 'date-fns'

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  url = environment.appServerURL;
  breadcrumbEvent: EventEmitter<any> = new EventEmitter<any>();
  refreshSideMenuData: EventEmitter<any> = new EventEmitter<any>();
  resetPassword: EventEmitter<any> = new EventEmitter<any>();
  flag = false;
  privateEncryptionString = environment.storgageSecretKey;
  constructor(private http: HttpClient, private router: Router, private signalRService: SignalRService) { }

  convertUTCDateToLocal(utcDate) {
    debugger
    if (utcDate) {
      const options = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        //fractionalSecondDigits: 3,
        hour12: true,
      } as const;
      if (utcDate.includes('T') && utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000Z
        return new Date(utcDate).toLocaleString('en-US', options);
      } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000
        return new Date(utcDate + 'Z').toLocaleString('en-US', options);
      } else {
        // 1/20/2021 10:47:59 AM
        return new Date(utcDate + ' UTC').toLocaleString('en-US', options);
      }
    }
    return null;
  }

  convertUTCDateToLocalDate(utcDate) {
    if (utcDate) {
      const options = { year: 'numeric', month: 'short', day: '2-digit' } as const;
      if (utcDate.includes('T') && utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000Z
        return new Date(utcDate).toLocaleString('en-US', options);
      } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000
        return new Date(utcDate + 'Z').toLocaleString('en-US', options);
      } else {
        // 1/20/2021 10:47:59 AM
        return new Date(utcDate + ' UTC').toLocaleString('en-US', options);
      }
    }
    return null;
  }

  convertDateToEpoch(date: string) {
    debugger
    if (date) {
      var ldate = this.convertUTCDateToLocal(date)
      let dt = new Date(ldate);
      let epoch = datefns.getUnixTime(dt);
      return epoch
    }
    return 0;
  }

  convertEpochToDate(epoch) {
    if (epoch) {
      console.log('convertepochtodate', datefns.format(datefns.fromUnixTime(epoch), 'dd-MM-yyyy hh:mm:ss'))
      return datefns.format(datefns.fromUnixTime(epoch), 'dd-MM-yyyy hh:mm:ss');
    }
    return null;
  }

  convertEpochToOnlyDate(epoch) {
    if (epoch) {
      return datefns.format(datefns.fromUnixTime(epoch), 'dd-MM-yyyy');
    }
    return null;
  }

  getFileData(url) {
    return this.http.get(url, {
      responseType: 'blob',
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
    return this.http.post(this.url + AppUrls.LOGIN, obj);
  }

  userSignUp(obj) {
    return this.http.post(this.url + AppUrls.GUEST_SIGNUP, obj);
  }

  userSignIn(obj) {
    return this.http.post(this.url + AppUrls.GUEST_LOGIN, obj);
  }

  decodeJWTToken(token): any {
    if (token) {
      try {
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
    return this.http.post(this.url + AppUrls.RESET_PASSWORD, obj, { params });
  }

  sortDataBaseOnTime(arr, key) {
    return arr.sort((a, b) => {
      return new Date(a[key]).getTime() - new Date(b[key]).getTime();
    });
  }

  sortObjectBasedOnKey(obj) {
    // const newObj = {};
    const keys = Object.keys(obj).sort((a, b) => Number(a) - Number(b));
    // console.log(keys);
    // keys.forEach((key) => {
    //   newObj[key] = obj[key];
    // });
    // const newObj = Object.entries(obj)
    //   .sort(([, a], [, b]) => Number(a) - Number(b))
    //   .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
    // console.log(JSON.stringify(newObj));
    return keys;
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
      obj.from_date = datefns.getUnixTime(datefns.subMinutes(new Date(), 5));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 30 Mins') {
      obj.from_date = datefns.getUnixTime(datefns.subMinutes(new Date(), 30));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 1 Hour') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 1));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 3 Hours') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 3));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 6 Hours') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 6));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 12 Hours') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 12));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 24 Hours') {
      obj.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 24));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 7 Days') {
      obj.from_date = datefns.getUnixTime(datefns.subDays(new Date(), 6));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'This Week') {
      obj.from_date = datefns.getUnixTime(datefns.startOfISOWeek(new Date()));
      obj.to_date = datefns.getUnixTime(new Date());
    } else if (label === 'Last 4 Weeks') {
      obj.from_date = datefns.getUnixTime(datefns.subWeeks(datefns.startOfISOWeek(new Date()), 4));
      obj.to_date = datefns.getUnixTime(datefns.subWeeks(datefns.endOfISOWeek(new Date()), 1));
    }
    else if (label === 'This Month') {
      obj.from_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
      obj.to_date = datefns.getUnixTime(new Date());
    }
    else if (label === 'Last 30 Days') {
      obj.from_date = datefns.getUnixTime(datefns.subDays(new Date(), 29));
      obj.to_date = datefns.getUnixTime(new Date());
    }
    else if (label === 'Last Month') {
      obj.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 1));
      obj.to_date = datefns.getUnixTime(datefns.subMonths(datefns.endOfMonth(new Date()), 1));
    }
    else if (label === 'Last 3 Months') {
      obj.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 3));
      obj.to_date = datefns.getUnixTime(datefns.subMonths(datefns.endOfMonth(new Date()), 1));
    }
    else if (label === 'Last 6 Months') {
      obj.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 6));
      obj.to_date = datefns.getUnixTime(datefns.subMonths(datefns.endOfMonth(new Date()), 1));
    }
    else if (label === 'Last 12 Months') {
      obj.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 12));
      obj.to_date = datefns.getUnixTime(datefns.subMonths(datefns.endOfMonth(new Date()), 1));
    }
    else if (label === 'Today') {
      obj.from_date = datefns.getUnixTime(datefns.startOfDay(new Date()));
      obj.to_date = datefns.getUnixTime(new Date());
    }
    else if (label === 'Yesterday') {
      obj.from_date = datefns.getUnixTime(datefns.subDays(datefns.startOfDay(new Date()), 1));
      obj.to_date = datefns.getUnixTime(datefns.subDays(datefns.endOfDay(new Date()), 1));
    }
    else if (label === 'Last Week') {
      obj.from_date = datefns.getUnixTime(datefns.subWeeks(datefns.startOfISOWeek(new Date()), 1));
      obj.to_date = datefns.getUnixTime(datefns.subWeeks(datefns.endOfISOWeek(new Date()), 1));
    }
    return obj;
  }

  getValueFromModelMenuSetting(page, key) {
    const app = this.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    let value = key;
    app.menu_settings.model_control_panel_menu.forEach((item) => {
      if (item.page === page) {
        value = item.hasOwnProperty('accordion_value') ? item?.accordion_value[key] : key ;
      }
    });
    return value;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      // tslint:disable-next-line: no-bitwise
      const r = (Math.random() * 16) | 0;
      // tslint:disable-next-line: no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async uploadImageToBlob(file, folderName, containerName = undefined) {
    if (!containerName) {
      containerName = environment.blobContainerName;
    }
    const epoch = datefns.subSeconds(new Date(), 0).getTime();
    // const fileNameArr = file.name.split('.');
    // const fileExtension = fileNameArr[fileNameArr.length - 1];
    // fileNameArr.pop();
    // const fileName = fileNameArr.join() + '_' + epoch + '.' + fileExtension;
    const pipeline = newPipeline(new AnonymousCredential(), {
      retryOptions: { maxTries: 2 }, // Retry options
      keepAliveOptions: {
        enable: false,
      },
    });
    const blobServiceClient = new BlobServiceClient(environment.blobURL + environment.blobKey, pipeline);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containerClient.exists()) {
      await containerClient.create();
    }
    const blobUrl = folderName + '/' + epoch + '/' + file.name;
    const encodedBlobUrl = encodeURI(folderName) + '/' + epoch + '/' + encodeURI(file.name);
    const client = containerClient.getBlockBlobClient(blobUrl);
    const response = await client.uploadBrowserData(file, {
      blockSize: 4 * 1024 * 1024, // 4MB block size
      concurrency: 20, // 20 concurrency
      blobHTTPHeaders: { blobContentType: file.type },
    });
    if (response._response.status === 201) {
      return {
        url: containerName + '/' + encodedBlobUrl,
        name: file.name,
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
        const latitude = (coord.latitude * Math.PI) / 180;
        const longitude = (coord.longitude * Math.PI) / 180;
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
      latitude: (centralLatitude * 180) / Math.PI,
      longitude: (centralLongitude * 180) / Math.PI,
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
    const isGuestUser = localStorage.getItem(CONSTANTS.GUEST_USER);
    const app = this.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    localStorage.clear();
    this.signalRService.disconnectFromSignalR('all');
    if (environment.app === 'Indygo') {
      this.router.navigate(['login']).then(() => {
        location.reload();
      });
    } else {
      if (isGuestUser === 'true') {
        this.router.navigate([app.app, 'guest-login']).then(() => {
          location.reload();
        });
      } else {
        this.router.navigate(['']).then(() => {
          location.reload();
        });
      }
    }
  }

  getLowestValueFromList(arr) {
    return Math.min(...arr) || 60;
  }

  forgotPassword(obj) {
    return this.http.post(this.url + AppUrls.FORGOT_PASSWORD, obj);
  }
}
