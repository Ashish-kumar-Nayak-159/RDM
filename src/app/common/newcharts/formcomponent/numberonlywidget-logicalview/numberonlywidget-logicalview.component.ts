import { CONSTANTS } from 'src/app/constants/app.constants';
import { ToasterService } from './../../../../services/toaster.service';
import { CommonService } from './../../../../services/common.service';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AssetModelService } from 'src/app/services/asset-model/asset-model.service';

@Component({
  selector: 'app-numberonlywidget-logicalview',
  templateUrl: './numberonlywidget-logicalview.component.html',
  styleUrls: ['./numberonlywidget-logicalview.component.css']
})
export class NumberonlywidgetLogicalviewComponent implements OnInit {
  private _widgetObj: any;
  filteredPropList: any[];
  actualPropertyList: any[];
  Y1PropertyList: any[];
  Y2PropertyList: any[];
  private _drpassets: any;
  properties: any;
  public get drpassets(): any {
    return this._drpassets;
  }
  @Input()
  public set drpassets(value: any) {
    this._drpassets = value;
  }
  public get widgetObj(): any {
    return this._widgetObj;
  }
  @Input()
  public set widgetObj(value: any) {
    this._widgetObj = value;
    if (value)
      this.valueSet();
  }
  private _propertyList: any[];
  public get propertyList(): any[] {
    return this._propertyList;
  }
  @Input()
  public set propertyList(value: any[]) {
    this._propertyList = value;
  }
  @Input() assetModel: any;
  isFileUploading = false;
  dropdownProperties: any[] = [];
  contextApp: any;
  subscriptions: Subscription[] = [];
  selectedY1Assest: any;
  selectedY2Assest: any;
  constructor(private commonService: CommonService,
    private toasterService: ToasterService,
    private assetModelService: AssetModelService,
  ) { }

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    if (this.widgetObj?.widget_type !== 'SmallNumber') {
      this.properties = this.widgetObj.properties.map(o => ({ ...o }));
      if (this.widgetObj.properties[0].property) {
        this.widgetObj.properties.forEach(element => {
          element.property = element;
        });
      }
    }
  }

  addProperty() {
    this.widgetObj.properties.push({});
  }

  removeProperty(index) {
    this.widgetObj.properties.splice(index, 1);
  }

  onPropertySelection(prop) {
    if (prop?.property) {
      prop.property.data_type = prop.property.datatype;
      prop.title = prop.property.name;
      if (this.widgetObj?.widget_type === 'SmallNumber') {
        prop.digitsAfterDecimals = '1';
      }
    } else {
      prop.property = undefined;
      prop.title = undefined;
    }
  }

  onPropertyDeselect(prop) {
    prop.property = undefined;
    prop.title = undefined;
  }

  async onLogoFileSelected(files: FileList, index): Promise<void> {
    this.widgetObj.properties[index].image = files.item(0);
  }

  y1Deselect(e) {
    if (e === [] || e.length === 0) {
      this.widgetObj.y1AxisProps = [];
    }
  }
  y2Deselect(e) {
    if (e === [] || e.length === 0) {
      this.widgetObj.y2AxisProps = [];
    }
  }

  async getAssetsModelProperties(selectedAssest, type, index, isEdit = false) {
    // this.properties = {};

    await this.assetModelService.getModelPropertiesByAssetsId(selectedAssest).
      toPromise().then((response: any) => {
        // if (response?.data) {
        //   response["measured_properties"] = response.data.filter(x => x.type == "m");
        //   response["edge_derived_properties"] = response.data.filter(x => x.type == "ed");
        //   response["cloud_derived_properties"] = response.data.filter(x => x.type == "cd");
        // }

        this.filteredPropList = []
        this.propertyList = []
        this.actualPropertyList = []

        response = response[0];
        response.measured_properties = response.measured_properties
          ? response.measured_properties
          : [];
        response.measured_properties?.forEach((prop) => {
          prop.type = 'Measured Properties'
          this.actualPropertyList.push(prop);
          this.propertyList.push(prop);
        });

        response.edge_derived_properties = response.edge_derived_properties
          ? response.edge_derived_properties
          : [];
        response.cloud_derived_properties = response.cloud_derived_properties
          ? response.cloud_derived_properties
          : [];
        response.edge_derived_properties?.forEach((prop) => {
          prop.type = 'Edge Derived Properties';
          let matchCount = 0
          prop.metadata?.properties?.forEach((actualProp) => {
            matchCount++
          })
          if (matchCount > 0) {
            this.propertyList.push(prop)

          }
          this.actualPropertyList.push(prop);
        });
        response?.cloud_derived_properties?.forEach((prop) => {
          prop.type = 'Cloud Derived Properties';
          this.propertyList.push(prop);
          this.actualPropertyList.push(prop);
        });

        this.propertyList.forEach((prop) => {
          if (prop.data_type !== 'Object' && prop.data_type !== 'Array') {
            this.filteredPropList.push(prop);
          }
        });

        if (type == 0) {
          this.Y1PropertyList = this.filteredPropList;
          this.widgetObj["Y1Assest"] = selectedAssest;
          this.widgetObj["y1AxisProps"] = [];
        }
        else if (type == 1) {
          this.Y2PropertyList = this.filteredPropList;
          this.widgetObj["Y2Assest"] = selectedAssest;
          this.widgetObj["y2AxisProps"] = [];
        }
        else {
          this.widgetObj.properties[index].propertyList = this.filteredPropList;
          this.widgetObj.properties[index].property = null;
          // this.widgetObj.properties[index].title = this.properties[index]?.title;
          if (isEdit) {
            this.widgetObj.properties.forEach((element, index) => {
              let getName = this.filteredPropList.find(x => x.json_key == element?.json_key);
              if (getName) {
                element.name = getName?.name;
                element.data_type = getName?.data_type;
                element.property = getName;
              }
            });
          }
          // this.widgetObj.properties = this.widgetObj.properties.map(o => ({ ...o }));
        }
      })
  }

  async valueSet() {
    if (this.widgetObj.widget_type == "LineChart" || this.widgetObj.widget_type == "AreaChart") {

      this.selectedY1Assest = this.widgetObj.properties[0].y1AxisProps[0].asset_id;
      this.selectedY2Assest = this.widgetObj.properties[0].y2AxisProps[0]?.asset_id;
      await this.getAssetsModelProperties(this.selectedY1Assest, 0, 0);

      if (this.selectedY2Assest) {
        await this.getAssetsModelProperties(this.selectedY2Assest, 1, 0);
      }
    }
    else if (this.widgetObj.widget_type !== "LineChart" || this.widgetObj.widget_type !== "AreaChart" || this.widgetObj.widget_type !== "ConditionalNumber") {

      this.widgetObj.properties.forEach(async (element, index) => {
        if (element.asset_id) {
          await this.getAssetsModelProperties(element.asset_id, 2, index, true);

        }
      });
    }

  }

  onColorChangeComplete(event) { }
}


