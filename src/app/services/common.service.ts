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
  widgetId: EventEmitter<any> = new EventEmitter();
  flag = false;
  browsername: any = '';
  privateEncryptionString = environment.storgageSecretKey;
  constructor(private http: HttpClient, private router: Router, private signalRService: SignalRService) {
    this.browsername = this.getBrowserName()
  }

  public getBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }


  convertUTCDateToLocal(utcDate) {
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
      if (utcDate.toString().match(/^[0-9]{10}$/)) {
        return new Date(Number(utcDate) * 1000).toLocaleString('en-US', options);
      } else if (utcDate.toString().match(/^[0-9]{13}$/)) {
        return new Date(Number(utcDate)).toLocaleString('en-US', options);
      } else if (utcDate.includes('T') && utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000Z
        return new Date(utcDate).toLocaleString('en-US', options);
      } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
        // 2011-06-29T16:52:48.000
        return new Date(utcDate + 'Z').toLocaleString('en-US', options);
      } else {
        if (this.browsername === 'firefox') {
          // 1/20/2021 10:47:59 AM
          // Getting invalid date Zoho K-1-I57
          //  I have added 'Z' at the end of the UTC date so it will display proper in mozilla firefox
          return new Date(utcDate + 'Z').toLocaleString('en-US', options);
        } else {
          // 1/20/2021 10:47:59 AM
          return new Date(utcDate + ' UTC').toLocaleString('en-US', options);
        }
      }
    }
    return null;
  }

  convertUTCDateToLocalDateObj(utcDate: any) {
    if (!utcDate) return null;
    utcDate = utcDate.toString();
    if (utcDate.includes('T') && utcDate.includes('Z')) {
      return new Date(utcDate);
    } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
      return new Date(utcDate + 'Z');
    } else if (/^[0-9]{10}$/.test(utcDate)) {
      return new Date(Number(utcDate) * 1000);
    } else if (/^[0-9]{13}$/.test(utcDate)) {
      const newDate = new Date(Number(utcDate));
      return newDate;
    } else {
      return new Date(utcDate + ' UTC');
    }
  }

  convertUTCDateToLocalDate(utcDate: any, format: string = '') {
    if (utcDate) {
      const options = { year: 'numeric', month: 'short', day: '2-digit' } as const;
      if (format.length > 0) {
        if (utcDate.includes('T') && utcDate.includes('Z')) {
          return datefns.format(new Date(utcDate), format);
        } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
          return datefns.format(new Date(utcDate + 'Z'), format);
        } else {
          return datefns.format(new Date(utcDate + ' UTC'), format);
        }
      }
      else {
        if (utcDate.includes('T') && utcDate.includes('Z')) {
          return new Date(utcDate).toLocaleString('en-US', options);
        } else if (utcDate.includes('T') && !utcDate.includes('Z')) {
          return new Date(utcDate + 'Z').toLocaleString('en-US', options);
        } else {
          return new Date(utcDate + ' UTC').toLocaleString('en-US', options);
        }
      }
    }
    return null;
  }

  convertDateToEpoch(date: string) {
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
    return '#' + (Math.floor(((crypto.getRandomValues(new Uint32Array(1))[0]) / (0xffffffff + 1)) * (0xffffff - 1)).toString(16));
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
    // keys.forEach((key) => {
    //   newObj[key] = obj[key];
    // });
    // const newObj = Object.entries(obj)
    //   .sort(([, a], [, b]) => Number(a) - Number(b))
    //   .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
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

  getMomentStartEndDate(dateOption: string, dateRange: any = {}) {
    if (dateOption === 'Last 5 Mins') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMinutes(new Date(), 5));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 30 Mins') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMinutes(new Date(), 30));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 1 Hour') {
      dateRange.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 1));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 3 Hours') {
      dateRange.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 3));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 6 Hours') {
      dateRange.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 6));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 12 Hours') {
      dateRange.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 12));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 24 Hours') {
      dateRange.from_date = datefns.getUnixTime(datefns.subHours(new Date(), 24));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 7 Days') {
      dateRange.from_date = datefns.getUnixTime(datefns.subDays(new Date(), 7));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'This Week') {
      dateRange.from_date = datefns.getUnixTime(datefns.startOfISOWeek(new Date()));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 4 Weeks') {
      dateRange.from_date = datefns.getUnixTime(datefns.subWeeks(datefns.startOfISOWeek(new Date()), 4));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfISOWeek(new Date()));
    } else if (dateOption === 'This Month') {
      dateRange.from_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last 30 Days') {
      dateRange.from_date = datefns.getUnixTime(datefns.subDays(new Date(), 30));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Last Month') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 1));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    } else if (dateOption === 'Last 3 Months') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 3));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    } else if (dateOption === 'Last 6 Months') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 6));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    } else if (dateOption === 'Last 12 Months') {
      dateRange.from_date = datefns.getUnixTime(datefns.subMonths(datefns.startOfMonth(new Date()), 12));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfMonth(new Date()));
    } else if (dateOption === 'Today') {
      dateRange.from_date = datefns.getUnixTime(datefns.startOfDay(new Date()));
      dateRange.to_date = datefns.getUnixTime(new Date());
    } else if (dateOption === 'Yesterday') {
      dateRange.from_date = datefns.getUnixTime(datefns.subDays(datefns.startOfDay(new Date()), 1));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfDay(new Date()));
    } else if (dateOption === 'Last Week') {
      dateRange.from_date = datefns.getUnixTime(datefns.subWeeks(datefns.startOfISOWeek(new Date()), 1));
      dateRange.to_date = datefns.getUnixTime(datefns.startOfISOWeek(new Date()));
    }
    return dateRange;
  }

  getValueFromModelMenuSetting(page, key) {
    const app = this.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    let value = key;
    app.menu_settings.model_control_panel_menu.forEach((item) => {
      if (item.page === page) {
        value = item.hasOwnProperty('accordion_value') ? item?.accordion_value[key] : key;
      }
    });
    return value;
  }

  generateUUID(): any {
    let u = Date.now().toString(16) + Math.random().toString(16) + '0'.repeat(16);
    let guid = [u.substr(0, 8), u.substr(8, 4), '4000-8' + u.substr(13, 3), u.substr(16, 12)].join('-');
    return guid
  }

  async uploadImageToBlob(file, folderName,iconsize?, containerName = undefined) {
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
      if(iconsize && iconsize?.modelOpenFlag==='mapPinIcon'){
        return {
          url: containerName + '/' + encodedBlobUrl,
          name: file.name,
          height:iconsize.height,
          width:iconsize.width
        };
      }else{
        return {
          url: containerName + '/' + encodedBlobUrl,
          name: file.name,
        };
      }
    }
    return null;
  }

  randomIntFromInterval(min, max): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
      this.router.navigate(['']).then(() => {
        location.reload();
      });
    }
  }

  getLowestValueFromList(arr) {
    return Math.min(...arr) || 60;
  }

  forgotPassword(obj) {
    return this.http.post(this.url + AppUrls.FORGOT_PASSWORD, obj);
  }
  refreshToken(obj: any) {
    return this.http.post(this.url + AppUrls.REFRESH_TOKEN, obj)
  }

  upTime(asset_id: any, obj: any) {
    return this.http.patch(this.url + AppUrls.ASSET_UPTIME + asset_id, obj)
  }

  getAssetUpTime(asset_id: any) {
    return this.http.get(this.url + AppUrls.ASSET_UPTIME + asset_id)
  }

  appPrivilegesPermission(key: string) {
    const decodedToken = this.getdecodedToken();
    return decodedToken?.privileges?.indexOf(key) !== -1;
  }

  getdecodedToken() {
    return this.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
  }

  getMatchingPropertyFromPropertyList(jsonKey, jsonType, propertyList) {
    return propertyList.find((propObj) => propObj.json_key === jsonKey && propObj.type === jsonType);
  }
  storingInLocalStorage(alertDataObj, storage) {
    if(alertDataObj?.length != 0){
      localStorage.removeItem(storage);
      this.setItemInLocalStorage(storage, JSON.stringify(alertDataObj));
    }else
    localStorage.removeItem(storage);

  }

  getDefaultDateOptions() {
    let filterObj:any = {};
    filterObj["dateOption"] = CONSTANTS.Last30Days;
    const dateObj = this.getMomentStartEndDate(filterObj['dateOption']);
    filterObj["from_date"] = dateObj.from_date;
    filterObj["to_date"] = dateObj.to_date;
    return filterObj;
  }
  assetMonitoringFilterData: EventEmitter<any> = new EventEmitter<any>();
}
