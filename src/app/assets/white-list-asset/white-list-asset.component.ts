import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../services/common.service';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ToasterService } from 'src/app/services/toaster.service';
import { AssetService } from 'src/app/services/assets/asset.service';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
declare var $: any;
@Component({
  selector: 'app-white-list-asset',
  templateUrl: './white-list-asset.component.html',
  styleUrls: ['./white-list-asset.component.css']
})

export class WhiteListAssetComponent implements OnInit {

  contextApp: any = {};
  tileData: any;
  iotAssetsTab: any;
  legacyAssetsTab: any;
  iotGatewaysTab: any;
  componentState;
  constantData = CONSTANTS;
  decodedToken: any;
  isOpenAssetCreateModal = false;
  gateways: any[] = [];
  blobStorageURL = environment.blobURL;
  sasToken = environment.blobKey;
  templateFileName = environment.blobContainerName + '/' + CONSTANTS.DEFAULT_WHITELISTED_EXCEL_FILE;
  subscriptions: any[] = [];
  tabData: { tab_name: any; table_key: any };
  uploadedFile: any = []
  isCanUploadFile: boolean = false;
  isCreatePackageAPILoading: boolean = false;
  fileName: string = 'Choose File';
  constructor(private commonService: CommonService, private toasterService: ToasterService,
    private assetService: AssetService, private sanitizer: DomSanitizer) {
  }
  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getTileName();
    if (this.iotAssetsTab?.visibility) {
      this.componentState = CONSTANTS.IP_ASSET;
      await this.onTabChange(this.componentState);
    } else if (this.legacyAssetsTab?.visibility) {
      this.componentState = CONSTANTS.NON_IP_ASSET;
      await this.onTabChange(this.componentState);
    } else if (this.iotGatewaysTab?.visibility) {
      this.componentState = CONSTANTS.IP_GATEWAY;
      await this.onTabChange(this.componentState);
    }
    if (this.contextApp.metadata?.whitelist && this.contextApp.metadata?.whitelist.hasOwnProperty('importfile')) {
      this.templateFileName = environment.blobContainerName + '/' + this.contextApp.metadata.whitelist.importfile;
    }
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.page === 'Asset Whitelist') {
        selectedItem = item.showAccordion;
      }
      // Note : Need to add whitelist checking after app created.
    });
    this.tileData = selectedItem;
    selectedItem.forEach((item) => {
      this.tileData[item.name] = item.value;
    });
    this.iotAssetsTab = {
      visibility: this.tileData['IoT Assets'],
      tab_name: this.tileData['IoT Assets Tab Name'],
      table_key: this.tileData['IoT Assets Table Key Name'],
    };
    this.legacyAssetsTab = {
      visibility: this.tileData['Legacy Assets'],
      tab_name: this.tileData['Legacy Assets Tab Name'],
      table_key: this.tileData['Legacy Assets Table Key Name'],
    };
    this.iotGatewaysTab = {
      visibility: this.tileData['IoT Gateways'],
      tab_name: this.tileData['IoT Gateways Tab Name'],
      table_key: this.tileData['IoT Gateways Table Key Name'],
    };
  }

  onTabChange(type) {
    this.componentState = type;
    this.getTileName();
  }

  getAssets() {
    const componentState = this.componentState;
    this.componentState = undefined;
    setTimeout(() => {
      this.componentState = componentState;
    }, 500);
  }

  openImportWhiteListModal() {
    $('#addWhieListAsset').modal({ backdrop: 'static', keyboard: false, show: true });
  }
  onCloseModal(id) {
    $('#' + id).modal('hide');
  }
  onFileSelected(event) {
    this.isCanUploadFile = false;
    let allowedZipMagicNumbers = ["504b34", "d0cf11e0"];
    this.uploadedFile = [];
    if (event?.target?.files) {
      let fileList = event.target.files as FileList;
      let file = fileList.item(0);
      let filereader = new FileReader();
      filereader.onloadend = () => {
        let contentHeader = filereader.result as ArrayBufferLike;
        let arr = (new Uint8Array(contentHeader)).subarray(0, 4);
        let header = '';
        for (let arrvalue of arr) {
          header += arrvalue.toString(16);
        }
        if (allowedZipMagicNumbers.includes(header)) {
          this.uploadedFile = file;
          this.isCanUploadFile = true;
          this.fileName = file.name;
        }
        else {
          this.toasterService.showError('Only .xls or .xlsx files are allowed', 'Select File');
          this.fileName = 'Choose File';
        }
        return;
      }
      filereader.readAsArrayBuffer(file);
    }
  }
  onUploadWhitelistedAsset() {
    this.isCreatePackageAPILoading = true;
    if (this.uploadedFile.length <= 0)
      this.toasterService.showError("Please select file to upload", 'Whitelist Asset');
    const formData = new FormData();
    formData.append('file', this.uploadedFile);
    const method = this.assetService.uploadWhitelistedAsset(this.contextApp.app, formData);
    this.subscriptions.push(
      method.subscribe(
        (response: any) => {
          this.toasterService.showSuccess(response.message, 'Whitelist Asset');
          this.isCreatePackageAPILoading = false;
          this.onCloseModal('addWhieListAsset');
          this.getAssets();
        },
        (error) => {
          this.toasterService.showError(error.message, 'Whitelist Asset');
          this.isCreatePackageAPILoading = false;
        }
      )
    );
  }
}
