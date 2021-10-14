import { Subscription } from 'rxjs';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { AssetService } from 'src/app/services/assets/asset.service';
import { Asset } from 'src/app/models/asset.model';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from './../../../services/common.service';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
declare var $: any;
@Component({
  selector: 'app-c2d-purge',
  templateUrl: './c2d-purge.component.html',
  styleUrls: ['./c2d-purge.component.css'],
})
export class C2dPurgeComponent implements OnInit, OnDestroy {
  messageCount: number;
  @Input() asset: Asset = new Asset();
  userData: any;
  appName: string;
  @Input() componentState: string;
  modalConfig: {
    isDisplaySave: boolean;
    isDisplayCancel: boolean;
    saveBtnText: string;
    cancelBtnText: string;
    stringDisplay: boolean;
  };
  subscriptions: Subscription[] = [];
  contextApp: any;
  constantData = CONSTANTS;
  constructor(
    private assetService: AssetService,
    private toasterServie: ToasterService,
    private commonService: CommonService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
  }

  verifyQueueMessages() {
    this.messageCount = null;
    let params = new HttpParams();
    let assetId = this.asset.asset_id;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      assetId = this.asset.gateway_id;
    }
    params = params.set('asset_id', assetId);

    this.subscriptions.push(
      this.assetService.getQueueMessagesCount(params, this.appName).subscribe((response: any) => {
        this.messageCount = response.count;
      })
    );
  }

  openConfirmDialog() {
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true,
    };
    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onModalEvents(eventType) {
    if (eventType === 'save') {
      this.purgeQueueMessages();
    }
    $('#confirmMessageModal').modal('hide');
  }

  purgeQueueMessages() {
    let params = new HttpParams();
    let assetId = this.asset.asset_id;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      assetId = this.asset.gateway_id;
    }
    params = params.set('asset_id', assetId);
    // params = params.set('app', this.appName);
    this.subscriptions.push(
      this.assetService.purgeQueueMessages(params, this.appName).subscribe(
        (response: any) => {
          this.toasterServie.showSuccess(response.message, 'Purge Messages');
          this.verifyQueueMessages();
        },
        (error) => this.toasterServie.showError(error.message, 'Purge messages')
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
