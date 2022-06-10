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
  timeForm = new FormGroup({
    times: new FormArray([
      new FormGroup({
        from_time: new FormControl(''),
        to_time: new FormControl('')
      })
    ])
  })

  constructor(private commonService: CommonService, private toasterService: ToasterService) {
    console.log("default on value", this.on)
  }

  ngOnInit(): void {
    console.log("asset", this.asset.asset_id)
    this.commonService.getAssetUpTime(this.asset.asset_id).subscribe((response) => {
      console.log("asset-uptime-response", response)
    })
  }


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

  saveUpTime() {
    if (this.on) {
      var obj = {
        is_alltime_working: true
      }
      this.commonService.upTime(this.asset.asset_id, obj).subscribe((response) => {
        console.log("asset live for 24 hour", response)
      })
    }
    else {
     
      this.timeForm.value.times.forEach((item)=>{
           item.asset_uptime_registry_id = 0
      })
    
      var payload = {
        is_alltime_working: false,
        asset_uptime_registry: this.timeForm.value.times
      }

      console.log("payload for",payload)

     this.commonService.upTime(this.asset.asset_id,payload).subscribe((response)=>{
          console.log("while asset is not live for 24 hours",response)
     })

    }
  }

  addTime() {
    let msg = ''
    const control: any = this?.timeForm?.get('times') as FormArray
    console.log("control", control)
    control.controls.forEach((formGroup) => {
      if (!formGroup.get('from_time').value || !formGroup.get('to_time').value) {
        msg = 'Please Select Time'
      }
    })
    if (msg) {
      this.toasterService.showError(`${msg}`, 'Uptime')
      return;
    }

    const newFormGroup = new FormGroup({
      from_time: new FormControl(''),
      to_time: new FormControl('')
    })
    control.push(newFormGroup)
  }

  deleteFormGroup(index: number) {
    const control: any = this?.timeForm?.get('times') as FormArray
    control.removeAt(index)
  }

  startFormChange(event: any) {
    debugger
    console.log("startfromevent", event.target.value)
    let startFrom = event.target.value
    if (startFrom) {
      const control = this.timeForm.get('times') as FormArray
      control?.controls?.forEach((formGroup) => {
        if (startFrom > (formGroup?.get('from_time')?.value) && startFrom < (formGroup?.get('to_time')?.value)) {
          this.toasterService.showError('Please Select Another Time', 'Time Selection Error')
          event.target.value = ''
        }

      })
    }
  }

  EndToChange(event: any) {
    console.log("endTo", event.target.value)
    let endTo = event.target.value
    if (endTo) {
      const control = this.timeForm.get('times') as FormArray
      control?.controls?.forEach((formGroup) => {
        if (endTo > (formGroup?.get('from_time')?.value) && endTo < (formGroup?.get('to_time')?.value)) {
          this.toasterService.showError('Please Select Another Time', 'Time Selection Error')
          event.target.value = ''
        }

      })
    }
  }

}
