import { Component, OnInit,Input, DoCheck } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-asset-uptime',
  templateUrl: './asset-uptime.component.html',
  styleUrls: ['./asset-uptime.component.css']
})
export class AssetUptimeComponent implements OnInit {
  
  @Input() tileData;
  @Input() asset;
  @Input() componentState;
  showHide:boolean;
  on:boolean = true;
  timeForm = new FormGroup({
    times: new FormArray([
      new FormGroup({
        fromdate: new FormControl(''),
        todate: new FormControl('')
      })
    ])
  })

  constructor(private commonService: CommonService) { 
    console.log("default on value", this.on)
  }

  ngOnInit(): void {
    console.log("asset",this.asset.asset_id)
  }


  checked(event:any,value:string){
    if(value==="on"){
      console.log("on",event.target.checked)
      if(event.target.checked){
        this.showHide = false
        this.on = true
      }
    }
    else{
      console.log("off",event.target.checked)
      if(event.target.checked){
        this.showHide = true
        this.on = false
      }
  
    }
  }

  saveUpTime(){
     if(this.on){
       var obj = {
         is_alltime_working : true
       }
       this.commonService.upTime(this.asset.asset_id,obj).subscribe((response)=>{
        console.log("asset live for 24 hour",response)
       })
     }
  }

}
