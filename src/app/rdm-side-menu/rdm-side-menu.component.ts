import { ToasterService } from './../services/toaster.service';
import { SignalRService } from './../services/signalR/signal-r.service';
import { Component, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { Subscription, interval } from 'rxjs';
import { AssetService } from '../services/assets/asset.service';
import { AssetModelService } from '../services/asset-model/asset-model.service';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-rdm-side-menu',
  templateUrl: './rdm-side-menu.component.html',
  styleUrls: ['./rdm-side-menu.component.css'],
})
export class RDMSideMenuComponent implements OnInit, OnChanges, OnDestroy {
  userData: any;
  constantsData = CONSTANTS;
  contextApp: any;
  displayMenuList = [];
  signalRAlertSubscription: any;
  apiSubscriptions: Subscription[] = [];
  activeFragment: any;
  currentURL: string;
  criticalToaster:boolean = false;
  errorToaster:boolean = false;
  warningToaster:boolean = false;
  informationalToaster:boolean = false;
  criticalFlag:boolean = false;
  errorFlag:boolean = false;
  warningFlag:boolean = false;
  informationalFlag:boolean = false;
  c_message:any;
  e_message:any;
  w_message:any;
  i_message:any;
  c_message_asset_display_name:any;
  e_message_asset_display_name:any;
  w_message_asset_display_name:any;
  i_message_asset_display_name:any;
  c_message_asset_id:any;
  e_message_asset_id:any;
  w_message_asset_id:any;
  i_message_asset_id:any;
  selectedAsset: any;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  audioUrl: any;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private toasterService: ToasterService,
    private signalRService: SignalRService,
    public route: ActivatedRoute,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
  ) { }

  async ngOnInit(): Promise<void> { 
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetData();
    if (this.contextApp && !this.userData?.is_super_admin) {
      this.connectToSignalR();
      this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe(async (msg) => {
        if ((!msg.type || msg.type === 'alert' && msg?.severity?.toLowerCase() === 'critical')) {
          await this.criticalAlertNotification(msg);
          this.toasterService.showCriticalAlert(
            msg.message,
            msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
            'toast-bottom-right',
            60000,
            this.audioUrl !== null ? this.criticalAlertAudioLoader(this.audioUrl) : ''
          )
          this.audioUrl='';

        }
        if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
          this.toasterService.showWarningAlert(
            msg.message,
            msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
            'toast-bottom-right',
            60000
          );
        }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'critical') {
        //   this.c_message = msg?.message
        //   this.c_message_asset_display_name = msg?.asset_display_name
        //   this.c_message_asset_id = msg?.asset_id
        //    this.criticalToaster = true
        //    this.criticalFlag = true
        //    setTimeout(()=>{
        //     this.criticalToaster = false;
        //   },20000)
        // }

        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'error') {
        //   this.e_message = msg?.message
        //   this.e_message_asset_display_name = msg?.asset_display_name
        //   this.e_message_asset_id = msg?.asset_id
        //   this.errorToaster = true
        //   this.errorFlag = true
        //   setTimeout(()=>{
        //     this.errorToaster = false;
        //   },20000)
        // }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
        //   this.w_message = msg?.message
        //   this.w_message_asset_display_name = msg?.asset_display_name
        //   this.w_message_asset_id = msg?.asset_id
        //   this.warningToaster = true
        //   this.warningFlag = true
        //   setTimeout(()=>{
        //     this.warningToaster = false;
        //   },20000)
        // }
        // if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'informational') {
        //   this.i_message = msg?.message
        //   this.i_message_asset_display_name = msg?.asset_display_name
        //   this.i_message_asset_id = msg?.asset_id
        //   this.informationalToaster = true
        //   this.informationalFlag = true
        //   setTimeout(()=>{
        //     this.informationalToaster = false;
        //   },20000)
        // }
      });
    }
    this.processAppMenuData();
    this.apiSubscriptions.push(
      this.commonService.refreshSideMenuData.subscribe((list) => {
        let config =
          list.menu_settings?.main_menu?.length > 0
            ? list.menu_settings.main_menu
            : JSON.parse(JSON.stringify(CONSTANTS.SIDE_MENU_LIST));
        config = JSON.parse(JSON.stringify(config));
        this.processSideMenuData(config, list);
      })
    );
  }
  criticalAlertAudioLoader(srcUrl?){
    let playAudio: HTMLAudioElement = new Audio();
    if(srcUrl){
      playAudio.src = srcUrl;
      return playAudio;
    }
  }

 async criticalAlertNotification(msg){
    return new Promise<void>((resolve) => {
      let asset_model_name: any;
      if (msg?.asset_id && msg?.severity && msg?.code) {
        if (this.selectedAsset?.length > 0) {
          this.selectedAsset.forEach((data) => {
            if (data?.asset_id === msg?.asset_id) {
              asset_model_name = data.asset_model;
            }
          });
        }
        const filterObj = {
          app: this.contextApp.app,
          asset_id: msg.asset_id,
          asset_model: asset_model_name
        };
        let assetResponseData;
        if (msg?.code?.startsWith('M_')) {
          const model = this.commonService.getItemFromLocalStorage(CONSTANTS.MODEL_ALERT_AUDIO);
          let isStorageAvailable = false;
          const getLocalModelAlertData = model ? JSON.parse(model) : [];
          if (getLocalModelAlertData?.length) {
            getLocalModelAlertData.forEach((modelAlert: any) => {
              if (modelAlert?.message.toLowerCase() === msg?.message.toLowerCase() && modelAlert?.alert_Id === msg?.asset_id && modelAlert?.msgCode.toLowerCase() === msg?.code.toLowerCase()) {
                this.audioUrl = modelAlert?.url;
                assetResponseData = null;
                isStorageAvailable = true;
              }
            })
          }
          if (isStorageAvailable == false) {
            assetResponseData = this.assetModelService.getAlertConditions(this.contextApp.app, filterObj);
          }
        }
        else {
          const asset_alert = this.commonService.getItemFromLocalStorage(CONSTANTS.ASSET_ALERT_AUDIO);
          const getLocalAssetAlertData = asset_alert ? JSON.parse(asset_alert) : [];
          let isAssetStorageAvailable = false;
          if (getLocalAssetAlertData?.length) {
            getLocalAssetAlertData.forEach((assetAlert: any) => {
              if (assetAlert?.message.toLowerCase() === msg?.message.toLowerCase() && assetAlert?.alert_Id === msg?.asset_id && assetAlert?.msgCode.toLowerCase() === msg?.code.toLowerCase()) {
                this.audioUrl = assetAlert.url;
                assetResponseData = null;
                isAssetStorageAvailable = true;
              }
            })
          }
          if (isAssetStorageAvailable == false) {
            assetResponseData = this.assetService.getAlertConditions(this.contextApp.app, filterObj);
          }
        }

        if (assetResponseData) {
          this.apiSubscriptions.push(
            assetResponseData.subscribe((response: any) => {
              if (response?.data) {
                response?.data.forEach((item) => {
                  if (msg?.severity?.toLowerCase() === item?.severity?.toLowerCase() && msg?.code === item?.code && msg?.source?.toLowerCase() === item?.alert_type?.toLowerCase()) {
                    if (item?.metadata && item?.metadata?.critical_alert_sound && item?.metadata?.critical_alert_sound?.url) {
                      this.audioUrl = this.blobStorageURL + (item.metadata.critical_alert_sound.url) + this.sasToken;
                      const alertDataObj = {
                        msgCode: msg?.code,
                        message: msg?.message,
                        alert_Id: msg?.asset_id,
                        url: this.audioUrl ? this.audioUrl : ''
                      }
                      if (msg?.code?.startsWith('M_')) {
                        this.storingInLocalStorage(alertDataObj, msg,CONSTANTS.MODEL_ALERT_AUDIO);
                      }
                      else {
                        this.storingInLocalStorage(alertDataObj, msg,CONSTANTS.ASSET_ALERT_AUDIO);
                      }
                    }
                  }
                  resolve();
                });
              }
            })
          )
          assetResponseData = null;
        } else
          if (!assetResponseData) {
            resolve();
          }
      }
    });
  }

  storingInLocalStorage(alertDataObj, msg, storage) {
    let margeNewAlertData: any[] = [];
    const preData = this.commonService.getItemFromLocalStorage(storage);
    const alertData = preData ? JSON.parse(preData) : [];
    if (alertData?.length) {
      alertData.forEach((item: any) => {
        if (item?.msgCode != msg?.code && item?.message !== msg?.message) {
          margeNewAlertData.push(item, alertDataObj);
        }
      })
    } else {
      margeNewAlertData.push(alertDataObj);
    }
    this.commonService.setItemInLocalStorage(storage, JSON.stringify(margeNewAlertData));
  }
  getAssetData() {
    const obj = {
      hierarchy: JSON.stringify(this.contextApp.user.hierarchy),
      type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET + ',' + CONSTANTS.IP_GATEWAY,
    };
    const method = this.assetService.getAndSetAllAssets(obj, this.contextApp.app);
    this.apiSubscriptions.push(
      method.subscribe((response: any) => {
        if (response?.data?.length > 0) {
          this.selectedAsset = response.data;
        }
      })
    );
  }

  processAppMenuData() {
    if (this.contextApp?.app) {
      if (!this.userData?.is_super_admin) {
        let data = [];
        const arr = JSON.parse(JSON.stringify(this.constantsData.SIDE_MENU_LIST));
        if (this.contextApp.menu_settings?.main_menu?.length > 0) {
          arr.forEach((config) => {
            let found = false;
            this.contextApp.menu_settings.main_menu.forEach((item) => {
              if (config.page === item.page) {
                found = true;
                config.display_name = item.display_name;
                config.visible = item.visible;
                config.showAccordion = item.showAccordion;
                config.index = item.index;
                data.push(config);
              }
            });
            if (!found) {
              data.push(config);
            }
          });
        } else {
          data = arr;
        }
        data = data.sort((a, b) => a.index - b.index);

        this.processSideMenuData(data, this.contextApp);
      }
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.userData) {
      this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
      if (this.contextApp) {
        // alert('here');
        this.connectToSignalR();
        this.getAssetData();
        this.signalRAlertSubscription = this.signalRService.signalROverlayAlertData.subscribe(async (msg) => {
          if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'critical') {
            await this.criticalAlertNotification(msg);
            this.toasterService.showCriticalAlert(
              msg.message,
              msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
              'toast-bottom-right',
              60000,
              this.audioUrl !== null ? this.criticalAlertAudioLoader(this.audioUrl) : ''
            );
            this.audioUrl='';
          }
          if ((!msg.type || msg.type === 'alert') && msg?.severity?.toLowerCase() === 'warning') {
            this.toasterService.showWarningAlert(
              msg.message,
              msg.asset_display_name ? msg.asset_display_name : msg.asset_id,
              'toast-bottom-right',
              60000
            );
          }
        });
        this.processAppMenuData();
      }
    }
  }

  connectToSignalR() {
    this.signalRAlertSubscription?.unsubscribe();
    this.signalRService.disconnectFromSignalR('overlay');
    const obj = {
      levels: this.contextApp.hierarchy.levels,
      hierarchy: this.contextApp.user.hierarchy,
      type: 'alert',
      app: this.contextApp.app,
    };
    this.signalRService.connectToSignalR(obj, 'overlay');
  }

  processSideMenuData(data, list) {
    const arr = JSON.parse(JSON.stringify(data));
    const token = localStorage.getItem(CONSTANTS.APP_TOKEN);
    const decodedToken = this.commonService.decodeJWTToken(token);
    const appData = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    arr.forEach((element1) => {
      if (element1?.visible) {
        let trueCount = 0;
        let falseCount = 0;
        element1?.privileges_required?.forEach((privilege) => {
          if (decodedToken?.privileges?.indexOf(privilege) !== -1) {
            if (element1?.page === 'Maintenance') {
              if (appData?.metadata?.maintenance_module)
                trueCount++;
              else
                falseCount++;
            } else {
              trueCount++;
            }
          } else {
            falseCount++;
          }
        });
        if (trueCount > 0) {
          element1.visible = true;
        } else {
          if (falseCount > 0) {
            element1.visible = false;
          }
        }
      }
    });
    this.displayMenuList = JSON.parse(JSON.stringify(arr));
  }

  getURL(url) {
    return url ? url.replace(':appName', this.decode(this.contextApp.app)) : url;
  }

  decode(item) {
    return decodeURIComponent(item);
  }

  ngOnDestroy() {
    this.apiSubscriptions.forEach((sub) => sub.unsubscribe());
    this.signalRService.disconnectFromSignalR('overlay');
    this.signalRAlertSubscription?.unsubscribe();
  }
}
