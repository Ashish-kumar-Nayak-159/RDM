import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';
declare var $;
@Component({
  selector: 'app-app-escalation-modal',
  templateUrl: './app-escalation-modal.component.html',
  styleUrls: ['./app-escalation-modal.component.css']
})
export class AppEscalationModalComponent implements OnInit {

  @Input() escalationDetails;
  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
 
  }

  resetSelectedObj(){
    
  }

  onClose(){
    $("#escalation").modal('hide')
  }

}
