import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
declare var $;

@Component({
  selector: 'app-app-view-acknowledge-modal',
  templateUrl: './app-view-acknowledge-modal.component.html',
  styleUrls: ['./app-view-acknowledge-modal.component.css']
})
export class AppViewAcknowledgeModalComponent implements OnInit {

  @Input() viewAckMaintenanceDetails;
  sasToken = environment.blobKey;
  blobStorageURL = environment.blobURL;
  selectedDocument:any;

  constructor(private sanitizer: DomSanitizer,private commonService: CommonService) { }

  ngOnInit(): void {
  }
  viewDocument(obj) {
    this.selectedDocument = obj;
    this.selectedDocument.sanitizedURL = this.sanitizeURL(this.selectedDocument.document_file_url);
  }
  resetSelectedObj()
  {
    this.selectedDocument = null
    console.log('reset selectedobj');
  }

  sanitizeURL(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.blobStorageURL + url + this.sasToken);
  }

  onClose(){
    $("#viewAcknowledge").modal('hide')
    this.viewAckMaintenanceDetails = []
  }

  onSave(){

  }

}
