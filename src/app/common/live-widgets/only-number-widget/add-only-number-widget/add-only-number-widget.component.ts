import { CONSTANTS } from 'src/app/constants/app.constants';
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


  }
  addProperty() {
    this.widgetObj.properties.push({});
  }

  removeProperty(index) {
    this.widgetObj.properties.splice(index, 1);
  }

  onPropertySelection(prop) {
    if (prop?.property) {
      // prop.property = prop.propertyArr;
      prop.title = prop.property.name;
      if(this.widgetObj?.widgetType === 'SmallNumber'){
        prop.digitsAfterDecimals = '1';
      }
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
    this.widgetObj.properties[index].image = files.item(0);
    // this.isFileUploading = true;
    // const data = await this.commonService.uploadImageToBlob(
    //   files.item(0),
    //   this.contextApp.app + '/models/' + this.assetModel.name + '/live-widgets'
    // );
    // if (data) {
    //   this.widgetObj.properties[index].image = data;
    // } else {
    //   this.toasterService.showError('Error in uploading file', 'Upload file');
    // }
    // this.isFileUploading = false;
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
