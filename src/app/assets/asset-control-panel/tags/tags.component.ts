import { Subscription } from 'rxjs';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';
import { Component, OnInit, Input, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Asset } from 'src/app/models/asset.model';
import { ActivatedRoute } from '@angular/router';
import { AssetService } from 'src/app/services/assets/asset.service';
import { ToasterService } from './../../../services/toaster.service';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { CommonService } from 'src/app/services/common.service';
import { MapsAPILoader } from '@agm/core';
declare var $: any;
@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.css'],
})
export class TagsComponent implements OnInit, OnDestroy {
  @Input() asset: Asset = new Asset();
  @Input() tileData: any;
  @Input() menuDetail: any;
  @Input() componentState: any;
  originalAsset: Asset = new Asset();
  assetCustomTags: any[] = [];
  assetVariables: any[] = [];
  assetModelTags: any[] = [];
  reservedTags: any[] = [];
  reservedTagsBasedOnProtocol: any[] = [];
  isReservedTagsEditable = false;
  isCustomTagsEditable = false;
  isVariablesEditable = false;
  isModelTagsEditable = false;
  tagsListToNotDelete = [
    'app',
    'created_date',
    'created_by',
    'asset_manager',
    'manufacturer',
    'serial_number',
    'mac_address',
    'protocol',
    'cloud_connectivity',
  ];
  tagsListToNotEdit = [
    'app',
    'created_date',
    'created_by',
    'manufacturer',
    'serial_number',
    'mac_address',
    'protocol',
    'cloud_connectivity',
  ];
  userData: any;
  // pageType: string;
  hierarchyTags: any[] = [];
  contextApp: any;
  assetModel: any;
  constantData = CONSTANTS;
  isUpdateAPILoading = false;
  originalAssetData: any;
  subscriptions: Subscription[] = [];
  modalConfig = {
    isDisplaySave: true,
    isDisplayCancel: true,
    saveBtnText: 'Yes',
    cancelBtnText: 'No',
    stringDisplay: true,
  };
  changeLocationOption: any;
  centerLatitude = 23.0225;
  centerLongitude = 72.5714;
  zoom = 8;
  @ViewChild('search') searchElementRef: ElementRef;
  decodedToken: any;
  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService,
    private toasterService: ToasterService,
    private commonService: CommonService,
    private assetModelService: AssetModelService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    const asset = JSON.parse(JSON.stringify(this.asset));
    this.asset = undefined;
    this.asset = JSON.parse(JSON.stringify(asset));
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    this.getAssetData();
  }

  getAssetData() {
    // this.asset.tags = {};
    let methodToCall;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      const obj = {
        gateway_id: this.asset.gateway_id,
        app: this.contextApp.app,
        asset_id: this.asset.asset_id,
      };
      methodToCall = this.assetService.getNonIPAssetTags(obj);
    } else {
      methodToCall = this.assetService.getAssetData(this.asset.asset_id, this.contextApp.app);
    }

    this.subscriptions.push(
      methodToCall.subscribe(async (response: any) => {
        if (this.componentState === CONSTANTS.NON_IP_ASSET && response && response.tags) {
          this.asset.tags = JSON.parse(JSON.stringify(response.tags));
        } else {
          this.asset = JSON.parse(JSON.stringify(response));
        }

        if (this.asset.tags?.hierarchy_json) {
          this.asset.hierarchy = this.asset.tags.hierarchy_json;
          // this.asset.tags.hierarchy = this.asset.tags.hierarchy_json;
        }
        this.asset.hierarchyString = '';
        const keys = Object.keys(this.asset.hierarchy);
        this.contextApp.hierarchy.levels.forEach((key, index) => {
          this.asset.hierarchyString += this.asset.hierarchy[key]
            ? this.asset.hierarchy[key] + (keys[index + 1] ? ' / ' : '')
            : '';
        });
        if (this.asset.tags.custom_tags && typeof this.asset.tags.custom_tags === 'string') {
          this.asset.tags.custom_tags = JSON.parse(this.asset.tags.custom_tags);
        }
        if (this.asset.tags.variables && typeof this.asset.tags.variables === 'string') {
          this.asset.tags.variables = JSON.parse(this.asset.tags.variables);
        }
        if (this.asset.tags.model_tags && typeof this.asset.tags.model_tags === 'string') {
          this.asset.tags.model_tags = JSON.parse(this.asset.tags.model_tags);
        }
        this.asset.tags.asset_users_arr = this.asset.tags.asset_manager.split(',');
        this.centerLatitude = this.asset.tags.latitude || 23.0225;
        this.centerLongitude = this.asset.tags.longitude || 72.5714;
        await this.getAssetModelDetail();
        this.getAssetDetail();
      })
    );
  }

  getAssetModelDetail() {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(this.asset.hierarchy),
        name: this.asset?.asset_model || this.asset?.tags?.asset_model,
        app: this.contextApp.app,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelDetails(obj.app, obj.name).subscribe((response: any) => {
          if (response) {
            this.assetModel = response;
            this.assetModel.name = obj.name;
            this.assetModel.app = obj.app;
            if (this.assetModel?.tags?.reserved_tags) {
              this.assetModel?.tags?.reserved_tags.forEach((tag) => {
                if (tag.defaultValue && !this.asset.tags[tag.key]) {
                  this.asset.tags[tag.key] = tag.defaultValue;
                }
              });
            }
          }
          resolve();
        })
      );
    });
  }

  getAssetDetail() {
    this.assetCustomTags = [];
    this.assetVariables = [];
    this.assetModelTags = [];
    if (!this.asset.tags) {
      this.asset.tags = {};
      this.assetCustomTags = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true,
        },
      ];
      this.assetVariables = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true,
        },
      ];
    }
    if (this.asset.tags && !this.asset.tags.custom_tags) {
      this.assetCustomTags = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true,
        },
      ];
    }
    if(this.asset.tags && !this.asset.tags.variables){
      this.assetVariables = [
        {
          id: 1,
          name: null,
          value: null,
          editable: true,
        },
      ];
    }
    if(this.asset.tags) {
      if(this.asset?.tags?.custom_tags){
        Object.keys(this.asset?.tags?.custom_tags).forEach((key, index) => {
          this.assetCustomTags.push({
            id: index,
            name: key,
            value: this.asset.tags.custom_tags[key],
          });
        });
        this.assetCustomTags.push(
          {
            id: Object.keys(this.asset?.tags?.custom_tags ?? {}).length ,
            name: null,
            value: null,
            editable: true,
          },
        );
      }
      if(this.asset?.tags?.variables){
        Object.keys(this.asset?.tags?.variables).forEach((key, index) => {
          this.assetVariables.push({
            id: index,
            name: key,
            value: this.asset.tags.variables[key],
          });
        });
        this.assetVariables.push(
          {
            id: Object.keys(this.asset?.tags?.variables ?? {}).length ,
            name: null,
            value: null,
            editable: true,
          },
        );
      }
        Object.keys(this.assetModel?.tags?.reserved_tags ?? this.asset?.tags?.model_tags).forEach((key, index) => {
          this.assetModelTags.push({
            id: index,
            name: this.assetModel?.tags?.reserved_tags[index]['name'],
            value: this.assetModel?.tags?.reserved_tags[index]['defaultValue']
          });
        });
    }
    if (this.asset.tags) {
      if (this.asset.tags.created_date) {
        this.asset.tags.local_created_date = this.commonService.convertUTCDateToLocal(this.asset.tags.created_date);
      }
    }
    console.log(this.assetCustomTags);
    
    this.originalAsset = null;
    this.originalAsset = JSON.parse(JSON.stringify(this.asset));
  }

  onCustomTagInputChange() {
    let count = 0;
    this.assetCustomTags.forEach((tag, index) => {
      if (tag.name && tag.value && !this.assetCustomTags[index + 1]) {
        count += 1;
      }
    });
    if (count > 0) {
      this.assetCustomTags.push({
        name: null,
        value: null,
        editable: true,
      });
    }
  }

  onVariableTagInputChange(){
    let count = 0;
    this.assetVariables.forEach((tag, index) => {
      if (tag.name && tag.value && !this.assetVariables[index + 1]) {
        count += 1;
      }
    });
    if (count > 0) {
      this.assetVariables.push({
        name: null,
        value: null,
        editable: true,
      });
    }
  }

  openModal(id) {
    $('#' + id).modal({ backdrop: 'static', keyboard: false, show: true });
  }

  resetAssetTags(event) {
    if (event === 'save') {
      this.isUpdateAPILoading = true;
      this.asset = null;
      this.asset = JSON.parse(JSON.stringify(this.originalAsset));
      this.asset.hierarchyString = '';
      let keys = [];
      if (this.asset.hierarchy) {
        keys = Object.keys(this.asset.hierarchy);
        keys.forEach((key, index) => {
          this.asset.hierarchyString += this.asset.hierarchy[key]
            ? this.asset.hierarchy[key] + (keys[index + 1] ? ' / ' : '')
            : '';
        });
      }
      $('#confirmResetTagsModal').modal('hide');
      this.getAssetDetail();
      this.isUpdateAPILoading = false;
    } else {
      this.isUpdateAPILoading = false;
      $('#confirmResetTagsModal').modal('hide');
    }
  }

  onChangeOfHierarchyTags() {
    this.asset.tags.hierarchy = JSON.stringify(this.asset.tags.hierarchy_json);
  }

  checkKeyDuplicacy(tagObj, tagIndex,type) {
    CONSTANTS.NOT_ALLOWED_SPECIAL_CHARS_NAME.forEach((char) => {
      if (tagObj?.name.includes(char)) {
        this.toasterService.showError('Tag key should not include `.`, ` `, `$`, `#`', 'Set Tags');
        return;
      }
    });
    let index;
    if(type=='custom_tags'){
      index = this.assetCustomTags.findIndex((tag) => tag.name === tagObj?.name);
    }
    if(type == 'variable'){
      index = this.assetVariables.findIndex((tag) => tag.name === tagObj?.name);
    }
    if (index !== -1 && index !== tagIndex) {
      this.toasterService.showError('Tag with same name is already exists. Please use different name', 'Set Tags');
      tagObj.name = undefined;
    }

  }

  updateAssetTags() {
    console.log('this.asset.tags ',this.asset.tags);
    
    if((this.asset.tags.latitude && !this.asset.tags.longitude) || (!this.asset.tags.latitude && this.asset.tags.longitude)){
      this.toasterService.showError("Select proper location", 'Set Asset Location');
      return;
    }
    this.isUpdateAPILoading = true;
    let tagObj = {};
    // if (this.asset.tags?.custom_tags) {
    //   Object.keys(this.asset.tags?.custom_tags).forEach((customTag) => {
    //     let flag = false;
    //     this.assetCustomTags.forEach((tag) => {
    //       if (tag.name === customTag) {
    //         flag = true;
    //       }
    //     });
    //     if (!flag) {
    //       tagObj[customTag] = null;
    //     }
    //   });
    // }
    this.assetCustomTags.forEach((tag) => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.asset.tags.custom_tags = JSON.stringify(tagObj);
    tagObj = {}
    this.assetVariables.forEach((tag) => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.asset.tags['variables'] = JSON.stringify(tagObj);
    tagObj = {}
    
    this.assetModelTags.forEach((tag) => {
      if (tag.name && tag.value) {
        tagObj[tag.name] = tag.value;
      }
    });
    this.asset.tags['model_tags'] = JSON.stringify(tagObj);
    const obj = {
      asset_id: this.asset.asset_id,
      display_name: this.asset.display_name,
      tags: this.asset.tags,
      sync_with_cache: this.asset?.tags?.display_name !== this.originalAsset?.tags?.display_name,
    };
    let methodToCall;
    if (this.componentState === CONSTANTS.NON_IP_ASSET) {
      methodToCall = this.assetService.updateNonIPAssetTags(obj, this.contextApp.app);
    } else {
      methodToCall = this.assetService.updateAssetTags(obj, this.contextApp.app);
    }
    if (this.asset?.tags?.display_name === '') {
      this.toasterService.showError('Asset display name should not be empty', 'Set Tags');
      this.isUpdateAPILoading = false;
    } else {
      this.subscriptions.push(
        methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess('Asset tags updated successfully.', 'Set Tags');
            this.onModalClose('changeLocationModal');
            this.getAssetData();
            this.isReservedTagsEditable = false;
            this.isUpdateAPILoading = false;
            this.isCustomTagsEditable = false;
            this.isModelTagsEditable = false;
            this.isVariablesEditable = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Set Tags');
            this.isUpdateAPILoading = false;
          }
        )
      );
    }
  }

  deleteCustomTag(index) {
    this.assetCustomTags.splice(index, 1);
  }

  deleteVariable(index) {
    this.assetVariables.splice(index, 1);
  }

  deleteAllAssetTags(event) {
    if (event === 'save') {
      this.isUpdateAPILoading = true;
      // const tagObj = {};
      // this.assetCustomTags.forEach((tag) => {
      //   if (tag.name && tag.value) {
      //     tagObj[tag.name] = null;
      //   }
      // });
      this.asset.tags.custom_tags = JSON.stringify({});
      // (Object.keys(this.asset.tags)).forEach(key => {
      //   if (this.tagsListToNotDelete.indexOf(key) === -1 && key !== 'custom_tags') {
      //     this.asset.tags[key] = null;
      //   }
      // });
      // this.asset.tags.custom_tags = tagObj;
      const obj = {
        asset_id: this.asset.asset_id,
        tags: this.asset.tags,
      };
      let methodToCall;
      if (this.componentState === CONSTANTS.NON_IP_ASSET) {
        methodToCall = this.assetService.updateNonIPAssetTags(obj, this.contextApp.app);
      } else {
        methodToCall = this.assetService.updateAssetTags(obj, this.contextApp.app);
      }
      this.subscriptions.push(
        methodToCall.subscribe(
          (response: any) => {
            this.toasterService.showSuccess(response.message, 'Delete Tags');
            $('#confirmdeleteTagsModal').modal('hide');
            this.asset.tags.custom_tags = {};
            this.getAssetData();
            this.isUpdateAPILoading = false;
          },
          (error) => {
            this.toasterService.showError(error.message, 'Delete Tags');
            this.isUpdateAPILoading = false;
          }
        )
      );
    } else {
      $('#confirmdeleteTagsModal').modal('hide');
    }
  }

  public mapReadyHandler(map: google.maps.Map): void {
    console.log('map ready');
    navigator.geolocation.getCurrentPosition(this.showPosition)
    this.asset.tags.latitude = this.centerLatitude;
    this.asset.tags.longitude = this.centerLongitude;
    map.addListener('click', (e: google.maps.MouseEvent) => {
      this.centerLatitude = e.latLng.lat();
      this.centerLongitude = e.latLng.lng();
      this.asset.tags.latitude = e.latLng.lat();
      this.asset.tags.longitude = e.latLng.lng();
      this.zoom = 12;
    });
  }

  showPosition = (position)=> {
    this.centerLatitude =  position?.coords?.latitude || this.centerLatitude;  
    this.centerLongitude = position.coords.longitude || this.centerLongitude;
  }

  onRadioChange() {
    setTimeout(() => {
      this.mapsAPILoader.load().then(() => {
        const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
          types: ['geocode'],
        });
        autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place: google.maps.places.PlaceResult = autocomplete.getPlace();
            if (place.geometry === undefined || place.geometry === null) {
              return;
            }
            this.zoom = 12;
            this.centerLatitude = place.geometry.location.lat();
            this.centerLongitude = place.geometry.location.lng();
            this.asset.tags.latitude = place.geometry.location.lat();
            this.asset.tags.longitude = place.geometry.location.lng();
          });
        });
      });
    }, 500);
  }

  onModalClose(id) {
    this.asset = JSON.parse(JSON.stringify(this.originalAsset));
    this.changeLocationOption = undefined;
    $('#' + id).modal('hide');
  }

  ngOnDestroy() {
    this.asset = JSON.parse(JSON.stringify(this.originalAsset));
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
