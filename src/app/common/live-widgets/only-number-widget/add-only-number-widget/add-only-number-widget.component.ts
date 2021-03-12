import { ToasterService } from './../../../../services/toaster.service';
import { CommonService } from './../../../../services/common.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-only-number-widget',
  templateUrl: './add-only-number-widget.component.html',
  styleUrls: ['./add-only-number-widget.component.css']
})
export class AddOnlyNumberWidgetComponent implements OnInit {

  @Input() widgetObj: any;
  @Input() propertyList: any[];
  isFileUploading = false;
  dropdownProperties: any[] = [];
  constructor(
    private commonService: CommonService,
    private toasterService: ToasterService
  ) { }

  ngOnInit(): void {
    this.propertyList.forEach(prop => {
      this.dropdownProperties.push({
        id: prop.json_key,
        value: prop,
        name: prop.name
      });
    });
  }

  addProperty() {
    this.widgetObj.properties.push({});
  }

  onPropertySelection(prop) {
    if (prop?.propertyArr.length > 0) {
      prop.property = prop.propertyArr[0];
      prop.title = prop.property.name;
    } else {
      prop.property = undefined;
      prop.propertyArr = undefined;
      prop.title = undefined;
    }
  }

  onPropertyDeselect(prop) {
    prop.property = undefined;
    prop.propertyArr = undefined;
    prop.title = undefined;
  }

  async onLogoFileSelected(files: FileList, index): Promise<void> {
    this.isFileUploading = true;
    const data = await this.commonService.uploadImageToBlob(files.item(0), 'device-type/live-widget-images' );
    if (data) {
      this.widgetObj.properties[index].image = data;
    } else {
      this.toasterService.showError('Error in uploading file', 'Upload file');
    }
    this.isFileUploading = false;
    // this.blobState.uploadItems(files);
  }

  y1Deselect(e){
    if (e === [] || e.length === 0) {
      this.widgetObj.y1AxisProps = [];
    }
  }
  y2Deselect(e){
    if (e === [] || e.length === 0) {
      this.widgetObj.y2AxisProps = [];
    }
  }

  onColorChangeComplete(event) {
    console.log(event);
  }
}
