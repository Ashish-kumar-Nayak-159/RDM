import { FileSaverService } from 'ngx-filesaver';
import { ToasterService } from './../../services/toaster.service';
import { AssetService } from './../../services/assets/asset.service';
import { AssetModelService } from './../../services/asset-model/asset-model.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CONSTANTS } from 'src/app/constants/app.constants';
import { ApplicationService } from 'src/app/services/application/application.service';
import { CommonService } from 'src/app/services/common.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { NgTranscludeDirective } from 'ngx-bootstrap/tabs';
declare var $: any;
@Component({
  selector: 'app-pre-generated-reports',
  templateUrl: './pre-generated-reports.component.html',
  styleUrls: ['./pre-generated-reports.component.css'],
})
export class PreGeneratedReportsComponent implements OnInit, AfterViewInit, OnDestroy {
  userData: any;
  filterObj: any = {};
  previousFilterObj: any = {};
  contextApp: any;
  hierarchyArr: any = {};
  configureHierarchy: any = {};
  assets: any[] = [];
  originalAssets: any[] = [];
  tileData: any;
  isDownloadCloseOptionAvailable = false;
  reportDownloadSubscription: Subscription;
  subscriptions: Subscription[] = [];
  isFilterOpen = true;
  today = new Date();
  isFilterSelected = false;
  reports: any[] = [];
  isReportDataLoading = false;
  @ViewChild('dtInput1', { static: false }) dtInput1: any;
  @ViewChild('dtInput2', { static: false }) dtInput2: any;
  blobStorageURL = environment.blobURL;
  sasToken = environment.blobKey;
  insideScrollFunFlag = false;
  currentOffset = 0;
  currentLimit = 20;
  hierarchyString: any;
  displayHierarchyString: string;
  selectedDateRange: string;
  isCreateReportAPILoading = false;
  propertyList: any[] = [];
  dropdownPropList: any[] = [];
  props: any[] = [];
  selectedProps: any[] = [];
  reportsObj: any = {};
  assetModels: any[] = [];
  selectedAssets: any[] = [];
  isAddReport = false;
  contextAppUserHierarchyLength = 0;
  decodedToken: any;
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private assetService: AssetService,
    private assetModelService: AssetModelService,
    private toasterService: ToasterService,
    private fileSaverService: FileSaverService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userData = this.commonService.getItemFromLocalStorage(CONSTANTS.USER_DETAILS);
    this.decodedToken = this.commonService.decodeJWTToken(localStorage.getItem(CONSTANTS.APP_TOKEN));
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.contextApp?.user?.hierarchy) {
      this.contextAppUserHierarchyLength = Object.keys(this.contextApp.user.hierarchy).length;
    }
    this.getTileName();
    this.getAssetsModels();
    this.subscriptions.push(
      this.route.paramMap.subscribe(async (params) => {
        if (params.get('applicationId')) {
          this.filterObj.app = this.contextApp.app;
          // this.filterObj.count = 10;
        }

        // this.getLatestAlerts();
        await this.getAssets(this.contextApp.user.hierarchy);
        setTimeout(() => {
          $('#table-wrapper').on('scroll', () => {
            const element = document.getElementById('table-wrapper');
            if (
              parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
                parseFloat(element.scrollHeight.toFixed(0)) &&
              !this.insideScrollFunFlag
            ) {
              this.currentOffset += this.currentLimit;
              this.getReportsData(false);
              this.insideScrollFunFlag = true;
            }
          });
        }, 2000);
        // this.propertyList = this.appData.metadata.properties ? this.appData.metadata.properties : [];
      })
    );
  }

  ngAfterViewInit() {
    const item = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
    console.log(item);
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    if (item) {
      this.loadFromCache(item);
    } else {
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
          if (this.contextApp.user.hierarchy[level]) {
            this.onChangeOfHierarchy(index, 'PG');
          }
        }
      });
    }
  }

  loadFromCache(item) {
    if (item.hierarchy) {
      if (Object.keys(this.contextApp.hierarchy.tags).length > 0) {
        this.contextApp.hierarchy.levels.forEach((level, index) => {
          if (index !== 0) {
            this.configureHierarchy[index] = item.hierarchy[level];
            console.log(this.configureHierarchy);
            if (item.hierarchy[level]) {
              this.onChangeOfHierarchy(index, 'PG');
            }
          }
        });
      }
    }
    console.log(item.dateOption);
    if (item.dateOption) {
      this.filterObj.dateOption = item.dateOption;
      if (item.dateOption !== 'Custom Range') {
        const dateObj = this.commonService.getMomentStartEndDate(item.dateOption);
        this.filterObj.from_date = dateObj.from_date;
        this.filterObj.to_date = dateObj.to_date;
        this.filterObj.last_n_secs = dateObj.to_date - dateObj.from_date;
      } else {
        this.filterObj.from_date = item.from_date;
        this.filterObj.to_date = item.to_date;
      }
      if (this.filterObj.dateOption !== 'Custom Range') {
        this.selectedDateRange = this.filterObj.dateOption;
      } else {
        this.selectedDateRange =
          moment.unix(this.filterObj.from_date).format('DD-MM-YYYY HH:mm') +
          ' to ' +
          moment.unix(this.filterObj.to_date).format('DD-MM-YYYY HH:mm');
      }
      this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
      this.getReportsData(false);
    }
    this.cdr.detectChanges();
  }

  onOpenConfigurePGRModal() {
    this.isAddReport = true;
    this.reportsObj = { assets: [] };
    this.assets = this.originalAssets;
    this.selectedAssets = this.originalAssets;
    $('#configurePGRModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  onCloseConfigurePGRModal() {
    $('#configurePGRModal').modal('hide');
    this.reportsObj = undefined;
    this.isAddReport = false;
    this.assets = [];
    this.selectedAssets = [];
  }

  onCreateNewPGReports() {
    this.isCreateReportAPILoading = true;
    if (
      !this.reportsObj.asset_model ||
      // !this.reportsObj.assets ||
      this.reportsObj.assets.length === 0 ||
      !this.reportsObj.report_name ||
      !this.reportsObj.report_category ||
      !this.reportsObj.report_frequency ||
      !this.reportsObj.report_type
    ) {
      this.toasterService.showError('Please fill all required details', 'Add Report');
      this.isCreateReportAPILoading = false;
      return;
    }
    if (!this.reportsObj.hierarchy) {
      this.reportsObj.hierarchy = { App: this.contextApp.app };
    }
    const obj = {};
    const measured_message_props = [];
    const edge_derived_message_props = [];
    const cloud_derived_message_props = [];
    this.props.forEach((prop, index) => {
      if (prop.value.type === 'Edge Derived Properties') {
        edge_derived_message_props.push(prop.value.json_key);
      } else if (prop.value.type === 'Cloud Derived Properties') {
        cloud_derived_message_props.push(prop.value.json_key);
      } else {
        measured_message_props.push(prop.value.json_key);
      }
    });
    obj['m'] = measured_message_props ? measured_message_props : undefined;
    obj['ed'] = edge_derived_message_props ? edge_derived_message_props : undefined;
    obj['cd'] = cloud_derived_message_props ? cloud_derived_message_props : undefined;
    console.log(obj);
    this.reportsObj.properties = { ...obj };
    // const assets = [];
    // if (this.reportsObj.asset.length > 0) {
    //   this.reportsObj.asset.forEach((asset) => {
    //     assets.push(asset.asset_id);
    //   }
    // )};
    // this.reportsObj.assets = assets;
    console.log(this.reportsObj);
    const reportObj = { ...this.reportsObj };
    delete reportObj.asset_model;
    this.subscriptions.push(
      this.assetService.createReportSubscription(this.contextApp.app, reportObj).subscribe(
        (response: any) => {
          this.isCreateReportAPILoading = false;
          this.toasterService.showSuccess('New Report Created', 'Create Report');
          this.onCloseConfigurePGRModal();
          console.log(response);
        },
        (error) => {
          this.isCreateReportAPILoading = false;
          this.toasterService.showError(error.message, 'Create Report');
        }
      )
    );
  }

  onReportChange() {
    if (this.reportsObj.report_category === 'telemetry') {
      if (this.reportsObj.asset_model) {
        this.getAssetsModelProperties(this.reportsObj.asset_model);
      }
    }
  }

  getAssetsModels() {
    this.assetModels = [];
    const obj = {
      app: this.contextApp.app,
      // model_type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
    };
    this.subscriptions.push(
      this.assetModelService.getAssetsModelsList(obj).subscribe((response: any) => {
        if (response && response.data) {
          response.data.forEach((model) => {
            if (model.model_type !== CONSTANTS.IP_GATEWAY) {
              this.assetModels.push(model);
            }
          });
          // this.assetModels = response.data;
        }
      })
    );
  }

  onChangeAssetsModel() {
    this.assets = [];
    this.reportsObj.assets = [];
    if (this.reportsObj.asset_model) {
      const asset = this.originalAssets.filter((assetObj) => assetObj.asset_model === this.reportsObj.asset_model);
      this.assets = [...asset];
      this.selectedAssets = this.assets;
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.onChangeOfHierarchy(index, 'RS');
        }
      });
    } else {
      this.assets = this.originalAssets;
      this.selectedAssets = this.assets;
      this.contextApp.hierarchy.levels.forEach((level, index) => {
        if (index !== 0) {
          this.onChangeOfHierarchy(index, 'RS');
        }
      });
    }
  }

  getAssetsModelProperties(assetModel) {
    return new Promise<void>((resolve) => {
      const obj = {
        app: this.contextApp.app,
        name: assetModel,
      };
      this.subscriptions.push(
        this.assetModelService.getAssetsModelProperties(obj).subscribe((response: any) => {
          response.properties.measured_properties = response.properties.measured_properties
            ? response.properties.measured_properties
            : [];
          response.properties?.measured_properties?.forEach((prop) => (prop.type = 'Measured Properties'));
          this.propertyList = response.properties.measured_properties ? response.properties.measured_properties : [];
          response.properties.edge_derived_properties = response.properties.edge_derived_properties
            ? response.properties.edge_derived_properties
            : [];
          response.properties.cloud_derived_properties = response.properties.cloud_derived_properties
            ? response.properties.cloud_derived_properties
            : [];
          response.properties.edge_derived_properties.forEach((prop) => {
            prop.type = 'Edge Derived Properties';
            this.propertyList.push(prop);
          });
          response.properties.cloud_derived_properties.forEach((prop) => {
            prop.type = 'Cloud Derived Properties';
            this.propertyList.push(prop);
          });
          this.dropdownPropList = [];
          this.props = [];
          this.propertyList.forEach((prop) => {
            this.dropdownPropList.push({
              id: prop.name,
              type: prop.type,
              value: prop,
            });
          });
          this.dropdownPropList = JSON.parse(JSON.stringify(this.dropdownPropList));
          console.log(this.dropdownPropList);
          // this.props = [...this.dropdownPropList];
          resolve();
        })
      );
    });
  }

  y1Deselect(e) {
    if (e === [] || e.length === 0) {
      this.props = [];
    }
  }

  Deselect(e) {
    if (e === [] || e.length === 0) {
      this.reportsObj.assets = [];
    }
  }

  onAssetFilterApply() {
    // $('.dropdown-menu .searchBtn').on('click.bs.dropdown', (e) => {
    //   $('button.dropdown-btn').dropdown('toggle');
    // });
  }

  onAssetFilterBtnClick() {
    $('.dropdown-menu .dropdown-open').on('click.bs.dropdown', (e) => {
      e.stopPropagation();
    });
    if (
      this.contextApp?.hierarchy?.levels?.length > 1 &&
      this.contextAppUserHierarchyLength !== this.contextApp?.hierarchy?.levels?.length
    ) {
      $('#dd-open').on('hide.bs.dropdown', (e: any) => {
        if (e.clickEvent && !e.clickEvent.target.className?.includes('searchBtn')) {
          e.preventDefault();
        }
      });
    }
  }

  onSaveHierachy() {
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
  }

  onClearHierarchy() {
    console.log('in clear');
    this.hierarchyArr = {};
    this.configureHierarchy = {};
    // this.filterObj = {};
    if (this.contextApp.hierarchy.levels.length > 1) {
      this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
    }
    console.log(this.hierarchyArr);
    this.contextApp.hierarchy.levels.forEach((level, index) => {
      if (index !== 0) {
        this.configureHierarchy[index] = this.contextApp.user.hierarchy[level];
        console.log(this.configureHierarchy);
        console.log(level);
        console.log(this.contextApp.user.hierarchy);
        if (this.contextApp.user.hierarchy[level]) {
          console.log('hereeeee');
          this.onChangeOfHierarchy(index, 'PG');
        }
      } else {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      }
    });
    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
  }

  scrollToTop() {
    $('#table-top').animate({ scrollTop: '0px' });
    //window.scrollTo(0, 0);
  }

  selectedDate(filterObj) {
    this.filterObj.from_date = filterObj.from_date;
    this.filterObj.to_date = filterObj.to_date;
    this.filterObj.dateOption = filterObj.dateOption;
    this.filterObj.last_n_secs = filterObj.last_n_secs;
  }

  getTileName() {
    let selectedItem;
    this.contextApp.menu_settings.main_menu.forEach((item) => {
      if (item.system_name === 'Reports') {
        selectedItem = item.showAccordion;
      }
    });
    this.tileData = selectedItem;
    this.currentLimit = Number(this.tileData[1]?.value) || 100;
  }

  getAssets(hierarchy) {
    return new Promise<void>((resolve) => {
      const obj = {
        hierarchy: JSON.stringify(hierarchy),
        type: CONSTANTS.IP_ASSET + ',' + CONSTANTS.NON_IP_ASSET,
      };
      this.subscriptions.push(
        this.assetService.getIPAndLegacyAssets(obj, this.contextApp.app).subscribe((response: any) => {
          if (response?.data) {
            this.assets = response.data;
            this.originalAssets = JSON.parse(JSON.stringify(this.assets));
          }
          resolve();
        })
      );
    });
  }

  async onChangeOfHierarchy(i, e) {
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (key > i) {
        delete this.configureHierarchy[key];
      }
    });
    Object.keys(this.hierarchyArr).forEach((key) => {
      if (key > i) {
        this.hierarchyArr[key] = [];
      }
    });
    let nextHierarchy = this.contextApp.hierarchy.tags;
    Object.keys(this.configureHierarchy).forEach((key, index) => {
      if (this.configureHierarchy[index + 1]) {
        nextHierarchy = nextHierarchy[this.configureHierarchy[index + 1]];
      }
    });
    if (nextHierarchy) {
      this.hierarchyArr[i + 1] = Object.keys(nextHierarchy);
    }
    // let hierarchy = {...this.configureHierarchy};
    const hierarchyObj: any = { App: this.contextApp.app };
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        hierarchyObj[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    if (e === 'PG') {
      this.filterObj.hierarchy = JSON.parse(JSON.stringify(hierarchyObj));
      if (Object.keys(hierarchyObj).length === 1) {
        this.assets = JSON.parse(JSON.stringify(this.originalAssets));
      } else {
        const arr = [];
        this.assets = [];
        this.originalAssets.forEach((asset) => {
          let trueFlag = 0;
          let flaseFlag = 0;
          Object.keys(hierarchyObj).forEach((hierarchyKey) => {
            if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
              trueFlag++;
            } else {
              flaseFlag++;
            }
          });
          if (trueFlag > 0 && flaseFlag === 0) {
            arr.push(asset);
          }
        });
        this.assets = JSON.parse(JSON.stringify(arr));
      }
    } else {
      this.reportsObj.assets = [];
      this.reportsObj.hierarchy = JSON.parse(JSON.stringify(hierarchyObj));
      console.log(this.reportsObj.hierarchy);
      if (Object.keys(hierarchyObj).length === 1) {
        this.assets = JSON.parse(JSON.stringify(this.selectedAssets));
      } else {
        const arr = [];
        this.assets = [];
        this.reportsObj.assets = [];
        this.selectedAssets.forEach((asset) => {
          let trueFlag = 0;
          let flaseFlag = 0;
          Object.keys(hierarchyObj).forEach((hierarchyKey) => {
            if (asset.hierarchy[hierarchyKey] && asset.hierarchy[hierarchyKey] === hierarchyObj[hierarchyKey]) {
              trueFlag++;
            } else {
              flaseFlag++;
            }
          });
          if (trueFlag > 0 && flaseFlag === 0) {
            arr.push(asset);
          }
        });
        this.assets = JSON.parse(JSON.stringify(arr));
      }
    }
    this.filterObj.assetArr = undefined;
    this.filterObj.asset_id = undefined;
    let count = 0;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        count++;
      }
    });
    if (count === 0) {
      this.hierarchyArr = [];
      if (this.contextApp.hierarchy.levels.length > 1) {
        this.hierarchyArr[1] = Object.keys(this.contextApp.hierarchy.tags);
      }
    }
  }

  onAssetDeselect() {
    this.filterObj.asset_id = undefined;
    this.filterObj.assetArr = undefined;
  }

  onAssetSelection() {
    if (this.filterObj?.assetArr.length > 0) {
      this.filterObj.asset_id = '';
      this.filterObj.assetArr.forEach((asset) => {
        this.filterObj.asset_id += (this.filterObj.asset_id.length > 0 ? ',' : '') + asset.asset_id;
      });
    } else {
      this.filterObj.asset_id = undefined;
      this.filterObj.assetArr = undefined;
    }
    // this.nonIPAssets = [];
    // this.filterObj.asset_id = this.filterObj.asset.asset_id;
  }

  onAllAssetSelection() {
    if (this.filterObj?.assetArr.length > 0) {
      this.filterObj.asset_id = '';
      this.filterObj.assetArr.forEach((asset) => {
        this.filterObj.asset_id += (this.filterObj.asset_id.length > 0 ? ',' : '') + asset.asset_id;
      });
    }
  }

  getReportsData(updateFilterObj = true) {
    this.insideScrollFunFlag = true;
    if (this.filterObj.dateOption !== 'Custom Range') {
      const dateObj = this.commonService.getMomentStartEndDate(this.filterObj.dateOption);
      this.filterObj.from_date = dateObj.from_date;
      this.filterObj.to_date = dateObj.to_date;
    } else {
      this.filterObj.from_date = this.filterObj.from_date;
      this.filterObj.to_date = this.filterObj.to_date;
    }
    const obj = { ...this.filterObj };
    // if (!obj.report_type) {
    //   this.toasterService.showError('Report Type selection is required', 'View Report');
    //   return;
    // }
    setTimeout(() => {
      $('#table-wrapper').on('scroll', () => {
        const element = document.getElementById('table-wrapper');
        if (
          parseFloat(element.scrollTop.toFixed(0)) + parseFloat(element.clientHeight.toFixed(0)) >=
            parseFloat(element.scrollHeight.toFixed(0)) &&
          !this.insideScrollFunFlag
        ) {
          this.currentOffset += this.currentLimit;
          this.getReportsData(false);
          this.insideScrollFunFlag = true;
        }
      });
    }, 2000);
    if (!obj.from_date || !obj.to_date) {
      this.toasterService.showError('Date selection is requierd.', 'View Report');
      return;
    }

    this.hierarchyString = this.contextApp.app;
    this.displayHierarchyString = this.contextApp.app;
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        this.hierarchyString += ' > ' + this.configureHierarchy[key];
        this.displayHierarchyString = this.configureHierarchy[key];
      }
    });
    if (updateFilterObj) {
      const pagefilterObj = this.commonService.getItemFromLocalStorage(CONSTANTS.MAIN_MENU_FILTERS) || {};
      pagefilterObj['hierarchy'] = this.configureHierarchy;
      pagefilterObj['from_date'] = obj.from_date;
      pagefilterObj['to_date'] = obj.to_date;
      pagefilterObj['dateOption'] = obj.dateOption;
      pagefilterObj.hierarchy = { App: this.contextApp.app };
      Object.keys(this.configureHierarchy).forEach((key) => {
        if (this.configureHierarchy[key]) {
          pagefilterObj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
        }
      });
      this.commonService.setItemInLocalStorage(CONSTANTS.MAIN_MENU_FILTERS, pagefilterObj);
    }
    obj.hierarchy = { App: this.contextApp.app };
    console.log(this.configureHierarchy);
    Object.keys(this.configureHierarchy).forEach((key) => {
      if (this.configureHierarchy[key]) {
        obj.hierarchy[this.contextApp.hierarchy.levels[key]] = this.configureHierarchy[key];
      }
    });
    obj.hierarchy = JSON.stringify(obj.hierarchy);
    this.isFilterSelected = true;
    delete obj.assetArr;
    delete obj.dateOption;
    delete obj.report_type;
    delete obj.asset_id;
    obj.offset = this.currentOffset;
    obj.count = this.currentLimit;
    this.isReportDataLoading = true;
    this.previousFilterObj = JSON.parse(JSON.stringify(this.filterObj));
    // this.reports = [];
    this.subscriptions.push(
      this.assetService.getPregeneratedReports(obj, this.contextApp.app).subscribe(
        (response: any) => {
          if (response.data?.length > 0) {
            // this.reports = response.data;
            response.data.forEach((report) => {
              report.local_start_date = this.commonService.convertUTCDateToLocalDate(report.report_start_date);
              report.local_end_date = this.commonService.convertUTCDateToLocalDate(report.report_end_date);
            });
            this.reports = [...this.reports, ...response.data];
            if (response.data.length === this.currentLimit) {
              this.insideScrollFunFlag = false;
            } else {
              this.insideScrollFunFlag = true;
            }
          }
          if (this.filterObj.dateOption === 'Custom Range') {
            this.previousFilterObj.dateOption = 'this selected range';
          }
          this.isReportDataLoading = false;
        },
        (error) => (this.isReportDataLoading = false)
      )
    );
  }

  getAssetNameById(assetId) {
    const asset = this.originalAssets.find((assetObj) => assetObj.asset_id === assetId);
    return asset?.display_name ? asset.display_name : assetId;
  }

  downloadFile(reportObj) {
    this.isDownloadCloseOptionAvailable = true;
    $('#downloadPreGeneratedReportReportModal').modal({ backdrop: 'static', keyboard: false, show: true });
    setTimeout(() => {
      const url = this.blobStorageURL + reportObj.report_url + this.sasToken;
      this.reportDownloadSubscription = this.commonService.getFileData(url).subscribe(
        (response) => {
          this.fileSaverService.save(response, reportObj.report_file_name);
          $('#downloadPreGeneratedReportReportModal').modal('hide');
        },
        (error) => {
          $('#downloadPreGeneratedReportReportModal').modal('hide');
        }
      );
    }, 500);
  }

  cancelDownloadModal() {
    $('#downloadPreGeneratedReportReportModal').modal('hide');
    this.reportDownloadSubscription?.unsubscribe();
    this.isDownloadCloseOptionAvailable = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.reportDownloadSubscription?.unsubscribe();
    $('#downloadPreGeneratedReportReportModal').modal('hide');
  }
}
