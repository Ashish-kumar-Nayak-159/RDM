import { SignalRService } from './signalR/signal-r.service';
import { Injectable, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AppUrls } from '../app-url.constants';
import { Router } from '@angular/router';
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
  constructor(
    private http: HttpClient,
    private router: Router,
    private signalRService: SignalRService
  ) {
    console.log('hereeee');
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
      // return (moment.utc(utcDate, 'M/DD/YYYY h:mm:ss A')).local().format('DD-MMM-YYYY hh:mm:ss A');
      // console.log(moment(new Date(utcDate + ' UTC').toString()).format('DD-MMM-YYYY hh:mm:ss A'));
     // return moment(new Date(utcDate).toISOString()).format('DD-MMM-YYYY hh:mm:ss.SSS A');
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

  resetUserPassword(obj) {
    return this.http.post(this.url + AppUrls.RESET_PASSWORD,  obj);
  }

  getItemFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setItemInLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    // let expiryObj: any = localStorage.getItem(CONSTANTS.EXPIRY_TIME);
    // const userData: any = JSON.parse(localStorage.getItem(CONSTANTS.USER_DETAILS));
    // if (!expiryObj && userData) {
    //   expiryObj = {};
    //   expiryObj.expired_at = (new Date().getTime()) + CONSTANTS.LOCAL_STORAGE_EXPIRY_INTERVAL;
    //   expiryObj.user = userData.email;
    //   localStorage.setItem(CONSTANTS.EXPIRY_TIME, JSON.stringify(expiryObj));
    // }
  }

  async uploadImageToBlob(file, folderName) {
    const containerName = environment.blobContainerName;
    const pipeline = newPipeline(new AnonymousCredential(), {
    retryOptions: { maxTries: 2 }, // Retry options
    keepAliveOptions: {
        // Keep alive is enabled by default, disable keep alive by setting false
        enable: false
    }
    });
    const blobServiceClient = new BlobServiceClient(environment.blobURL +  environment.blobKey, pipeline);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    if (!containerClient.exists()){
    console.log('the container does not exit');
    await containerClient.create();
    }
    console.log(folderName + '/' + file.name);
    const client = containerClient.getBlockBlobClient(folderName + '/' + file.name);
    const response = await client.uploadBrowserData(file, {
          blockSize: 4 * 1024 * 1024, // 4MB block size
          concurrency: 20, // 20 concurrency
          onProgress: (ev) => console.log(ev),
          blobHTTPHeaders : { blobContentType: file.type }
          });
    console.log(response._response);
    if (response._response.status === 201) {
      return {
        url: environment.blobURL + '/' + containerName + '/' + folderName + '/' + file.name,
        name: file.name
      };
    }
    return null;
  }

  randomIntFromInterval(min, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
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
