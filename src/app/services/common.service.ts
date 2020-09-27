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
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  convertUTCDateToLocal(utcDate) {
    if (utcDate) {
      return (moment.utc(utcDate, 'M/DD/YYYY h:mm:ss A')).local().format('DD-MMM-YYYY hh:mm:ss A');
    }
    return null;
  }

  loginUser(obj) {
    return this.http.post(this.url + AppUrls.LOGIN,  obj);
  }

  getItemFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  setItemInLocalStorage(key, value) {
    return localStorage.setItem(key, JSON.stringify(value));
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
    const client = containerClient.getBlockBlobClient(file.name);
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

  onLogOut() {
    localStorage.removeItem(CONSTANTS.USER_DETAILS);
    localStorage.removeItem('breadcrumbState');
    this.router.navigate(['']);
  }
}
