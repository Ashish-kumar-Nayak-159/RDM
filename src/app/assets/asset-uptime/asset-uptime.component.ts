import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';

@Component({
  selector: 'app-asset-uptime',
  templateUrl: './asset-uptime.component.html',
  styleUrls: ['./asset-uptime.component.css']
})
export class AssetUptimeComponent implements OnInit {

  @Input() tileData;
  @Input() asset;
  @Input() componentState;
  showHide: boolean;
  on: boolean = true;
  disableInputField: boolean = false;
  asset_uptime_registry_id: any = []
  timeForm = new FormGroup({
    times: new FormArray([])
  })
 payloadUptimeArray:any = []


  constructor(private commonService: CommonService, private toasterService: ToasterService) {
    console.log("default on value", this.on)
  }

  // calling API while initialization of component
  ngOnInit(): void {
    console.log("asset", this.asset.asset_id)
    const control = this.timeForm.get('times') as FormArray
    this.commonService.getAssetUpTime(this.asset.asset_id).subscribe((response: any) => {
      console.log("asset-uptime-response", response)
      this.disableInputField = true
      this.on = response?.data?.is_alltime_working
      if (!this.on) {
        this.showHide = true
      }
      if (!response?.data?.is_alltime_working) {
        response?.data?.asset_uptime_registry.forEach((item) => {
          const newFormGroup = new FormGroup({
            from_time: new FormControl(item?.from_time),
            to_time: new FormControl(item?.to_time)
          })
          control.push(newFormGroup)
          this.asset_uptime_registry_id.push(item?.asset_uptime_registry_id)
        })

        //  control.controls.forEach((formGroup)=>{
        //     formGroup.get('from_time').disable();
        //     formGroup.get('to_time').disable();
        //  })
      }
      else {
        const newFormGroup = new FormGroup({
          from_time: new FormControl(''),
          to_time: new FormControl('')
        })
        control.push(newFormGroup)
      }
      
    })
  }

  // changing boolean values & control UI for Answer:No
  checked(event: any, value: string) {
    if (value === "on") {
      console.log("on", event.target.checked)
      if (event.target.checked) {
        this.showHide = false
        this.on = true
      }
    }
    else {
      console.log("off", event.target.checked)
      if (event.target.checked) {
        this.showHide = true
        this.on = false
      }

    }
  }

  // call when someone click on save button
  saveUpTime() {
    console.log("this.on", this.on)
    if (this.on) {
      var obj = {
        is_alltime_working: true
      }
      this.commonService.upTime(this.asset.asset_id, obj).subscribe((response) => {
        console.log("asset live for 24 hour", response)
        this.toasterService.showSuccess('Asset uptime updated successfully', 'Asset uptime')
      }, (err) => {
        this.toasterService.showError('something went wrong !', 'Error')
      })
    }
    else {

      console.log("this.timeform.value.times",this.timeForm.value.times)
    
      this.payloadUptimeArray = []
      let array =  this.timeForm.get('times') as FormArray;
      array.controls.forEach((formGroup,index)=>{
          formGroup.value.asset_uptime_registry_id = this.asset_uptime_registry_id[index] ? this.asset_uptime_registry_id[index] : 0
          console.log(formGroup.value)
          this.payloadUptimeArray.push(formGroup.value)
      })

    

      var payload = {
        is_alltime_working: false,
        asset_uptime_registry: this.payloadUptimeArray
      }

      console.log("payload for", payload)

      this.commonService.upTime(this.asset.asset_id, payload).subscribe((response) => {
        console.log("while asset is not live for 24 hours", response)
        this.toasterService.showSuccess('Asset uptime updated successfully', 'Asset uptime')
      }, (err) => {
        this.toasterService.showError('something went wrong !', 'Error')
      })

    }
  }

  // add new input time field when click on (+) icon
  addTime() {
    let msg = ''
    const control: any = this?.timeForm?.get('times') as FormArray
    console.log("control", control)
    control.controls.forEach((formGroup) => {
      if ( !formGroup.get('from_time').value || ( !formGroup.get('to_time').value)) {
        msg = 'Please Select Time'
      }
    })
    if (msg) {
      this.toasterService.showError(`${msg}`, 'Asset Uptime')
      return;
    }

    const newFormGroup = new FormGroup({
      from_time: new FormControl(''),
      to_time: new FormControl('')
    })
    control.push(newFormGroup)
    console.log("new times array after pushing",this.timeForm.get('times'))
  }

  // call when someone click on trash or delete icon
  deleteFormGroup(index: number) {
    const control: any = this?.timeForm?.get('times') as FormArray
    control.removeAt(index)
    this.asset_uptime_registry_id.splice(index,1)
  }

  // when someone select start time
  startFormChange(event: any) {
    debugger
    console.log("startfromevent", event.target.value)
    let startFrom = event.target.value
    if (startFrom) {
      const control = this.timeForm.get('times') as FormArray
      control?.controls?.forEach((formGroup) => {
        if (startFrom > (formGroup?.get('from_time')?.value) && startFrom < (formGroup?.get('to_time')?.value)) {
          this.toasterService.showError('Please select time which should not fall in above time range.', 'Time Selection')
          event.target.value = ''
        }
      
      })
    }
  }

  // when someone select to time
  EndToChange(event: any,index?:number) {
    console.log("endTo", event.target.value)
    let endTo = event.target.value
    if (endTo) {
      const control = this.timeForm.get('times') as FormArray
      if(endTo <= control?.controls[index]?.get('from_time')?.value){
        this.toasterService.showError('To time must be greater than from time','Time Selection')
          event.target.value = ''
          return
      }

      try{
        control?.controls?.forEach((formGroup) => {
          debugger
        if (endTo > (formGroup?.get('from_time')?.value) && endTo < (formGroup?.get('to_time')?.value)) {
         this.toasterService.showError('Please select time which should not fall in above time range.', 'Time Selection')
         event.target.value = ''
         throw 'break';
       }
        if( control.controls[index].get('from_time').value  < (formGroup?.get('from_time')?.value) &&  control.controls[index].get('to_time').value  > (formGroup?.get('to_time')?.value) ){
         this.toasterService.showError('Please select time which should not overlap above time range', 'Time Selection')
         // event.target.value = ''
         control.controls[index].get('to_time').setValue('')
         throw 'break';
       }
   
     })
      }
      catch{

      }
     

      
    }
  }

  // enableField(index:number){
  //   const control =  this.timeForm.get('times') as FormArray
  //   control.controls[index].enable();
   
  // }

}
