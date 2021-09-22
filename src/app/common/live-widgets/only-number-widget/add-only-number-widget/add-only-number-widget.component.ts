import { CONSTANTS } from './../../../../app.constants';
import { ToasterService } from './../../../../services/toaster.service';
import { CommonService } from './../../../../services/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-only-number-widget',
  templateUrl: './add-only-number-widget.component.html',
  styleUrls: ['./add-only-number-widget.component.css'],
})
export class AddOnlyNumberWidgetComponent implements OnInit {
  @Input() widgetObj: any;
  @Input() propertyList: any[];
  @Input() assetModel: any;
  isFileUploading = false;
  dropdownProperties: any[] = [];
  contextApp: any;
  constructor(private commonService: CommonService, private toasterService: ToasterService) {}

  ngOnInit(): void {
    this.contextApp = this.commonService.getItemFromLocalStorage(CONSTANTS.SELECTED_APP_DATA);
    console.log(this.propertyList);
    this.propertyList.forEach((prop) => {
      this.dropdownProperties.push({
        id: prop.json_key,
        value: prop,
        name: prop.name,
        type: prop.type,
      });
    });
  }

  addProperty() {
    this.widgetObj.properties.push({});
  }

  removeProperty(index) {
    this.widgetObj.properties.splice(index, 1);
  }

  onPropertySelection(prop) {
    console.log(prop);
    if (prop?.property) {
      // prop.property = prop.propertyArr;
      prop.title = prop.property.name;
      // prop.load_value_using = 'signalr';
    } else {
      prop.property = undefined;
      // prop.propertyArr = undefined;
      prop.title = undefined;
    }
  }

  onPropertyDeselect(prop) {
    prop.property = undefined;
    // prop.propertyArr = undefined;
    prop.title = undefined;
  }

  async onLogoFileSelected(files: FileList, index): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(
      files.item(0),
      this.contextApp.app + '/models/' + this.assetModel.name + '/live-widgets'
    );
    if (data) {
      this.widgetObj.properties[index].image = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
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

  onColorChangeComplete(event) {}
}
