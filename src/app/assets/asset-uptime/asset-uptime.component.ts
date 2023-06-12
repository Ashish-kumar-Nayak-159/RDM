import { Component, OnInit, Input, DoCheck } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { ToasterService } from 'src/app/services/toaster.service';

declare var $: any;

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
  payloadUptimeArray: any = []
  confirmBodyMessage: string;
  confirmHeaderMessage: string;
  modalConfig: {
    isDisplaySave: boolean;
    isDisplayCancel: boolean;
    saveBtnText: string;
    cancelBtnText: string;
    stringDisplay: boolean;
  };
  isAPILoading = false;
  deleteIndex: number;
  emptyUptime: boolean = false;
  constructor(private commonService: CommonService, private toasterService: ToasterService, private router: Router) {

    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;

  }

  // calling API while initialization of component
  ngOnInit(): void {
    const control = this.timeForm.get('times') as FormArray
    this.commonService.getAssetUpTime(this.asset.asset_id).subscribe((response: any) => {
      this.disableInputField = true
      this.on = response?.data?.is_alltime_working
      if (!this.on) {
        this.showHide = true
      }
      if (!response?.data?.is_alltime_working) {
        response?.data?.asset_uptime_registry.forEach((item) => {
          let dummyLocalFromtime = '2022-01-15T' + item?.from_time + 'Z'
          let dummyLocalTotime = '2022-01-15T' + item?.to_time + 'Z'
          let localFromDate = new Date(dummyLocalFromtime).toLocaleString('it-IT').split(',')
          let localToDate = new Date(dummyLocalTotime).toLocaleString('it-IT').split(',')
          const newFormGroup = new FormGroup({
            from_time: new FormControl(localFromDate[1].trim()),
            to_time: new FormControl(localToDate[1].trim())
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
      if (event.target.checked) {
        this.showHide = false
        this.on = true
      }
    }
    else {
      if (event.target.checked) {
        this.showHide = true
        this.on = false
      }

    }
  }

  // call when someone click on save button
  saveUpTime() {
    this.emptyUptime = false
    if (this.on) {
      (this.timeForm.get('times') as FormArray).controls.splice(1, (this.timeForm.get('times') as FormArray)?.length - 1)
      var obj = {
        is_alltime_working: true
      }
      this.commonService.upTime(this.asset.asset_id, obj).subscribe((response: any) => {
        this.toasterService.showSuccess('Asset uptime updated successfully', 'Asset Uptime')
      }, (err) => {
        this.toasterService.showError(err.message, 'Asset Uptime')
      })

      this.timeForm.reset();
    }
    else {

      this.payloadUptimeArray = []
      let array = this.timeForm.get('times') as FormArray;

      array.controls.forEach((formGroup) => {
        if (!formGroup.get('from_time').value || !formGroup.get('to_time').value || !formGroup.get('from_time').value && !formGroup.get('to_time').value) {
          this.emptyUptime = true
          this.toasterService.showError('Please Select Time', 'Asset Uptime')
          return;
        }

      })
      array.controls.forEach((formGroup, index) => {
        //formGroup.value.asset_uptime_registry_id = this.asset_uptime_registry_id[index] ? this.asset_uptime_registry_id[index] : 0
        let array = formGroup.value.from_time.split(':')
        let array1 = formGroup.value.to_time.split(':')
        var date = new Date(2022, 2, 5, +array[0], +array[1]);
        var date1 = new Date(2022, 2, 5, +array1[0], +array1[1]);
        let utc_from_time: any = [this.padTo2Digits(date.getUTCHours()), this.padTo2Digits(date.getUTCMinutes())].join(':')
        let utc_to_time: any = [this.padTo2Digits(date1.getUTCHours()), this.padTo2Digits(date1.getUTCMinutes())].join(':')
        let tempFormGroupValue = Object.assign({}, formGroup.value);
        tempFormGroupValue.from_time = utc_from_time
        tempFormGroupValue.to_time = utc_to_time
        this.payloadUptimeArray.push(tempFormGroupValue)
      })

      if (!this.emptyUptime) {

        var payload = {
          is_alltime_working: false,
          asset_uptime_registry: this.payloadUptimeArray
        }

        this.commonService.upTime(this.asset.asset_id, payload).subscribe((response) => {
          this.toasterService.showSuccess('Asset uptime updated successfully', 'Asset Uptime')
          this.reloadCurrentRoute()

        }, (err) => {
          this.toasterService.showError(err.message, 'Asset Uptime')
        })
      }
    }
  }

  reloadCurrentRoute() {
    let currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      return this.router.navigateByUrl(currentUrl);
    });
  }

  // add new input time field when click on (+) icon
  addTime() {
    let msg = ''
    const control: any = this?.timeForm?.get('times') as FormArray
    control.controls.forEach((formGroup) => {
      if (!formGroup.get('from_time').value || (!formGroup.get('to_time').value)) {
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
  }

  // call when someone click on trash or delete icon
  deleteFormGroup(index: number) {
    this.deleteIndex = index
    this.openConfirmDialog()
  }

  openConfirmDialog() {
    this.modalConfig = {
      isDisplaySave: true,
      isDisplayCancel: true,
      saveBtnText: 'Yes',
      cancelBtnText: 'No',
      stringDisplay: true,
    };

    this.confirmBodyMessage = 'Are you sure you want to delete this uptime?';
    this.confirmHeaderMessage = 'Delete ' + 'Uptime';

    $('#confirmMessageModal').modal({ backdrop: 'static', keyboard: false, show: true });
  }

  // when someone select start time
  startFormChange(event: any) {
    let startFrom = event.target.value
    if (startFrom) {
      const control = this.timeForm.get('times') as FormArray
      // control?.controls?.forEach((formGroup) => {
      //   if (startFrom > (formGroup?.get('from_time')?.value) && startFrom < (formGroup?.get('to_time')?.value)) {
      //     this.toasterService.showError('Please select time which should not fall in above time range.', 'Asset Uptime')
      //     event.target.value = ''
      //   } 
      // })
    }
  }

  // when someone select to time
  EndToChange(event: any, index?: number) {
    let endTo = event.target.value
    // if (endTo) {
    //   const control = this.timeForm.get('times') as FormArray
    //   if (endTo <= control?.controls[index]?.get('from_time')?.value) {
    //     this.toasterService.showError('To time must be greater than from time', 'Asset Uptime')
    //     event.target.value = ''
    //     return
    //   }

    //   try {
    //     control?.controls?.forEach((formGroup) => {
    //       if (endTo > (formGroup?.get('from_time')?.value) && endTo < (formGroup?.get('to_time')?.value)) {
    //         this.toasterService.showError('Please select time which should not fall in above time range.', 'Asset Uptime')
    //         event.target.value = ''
    //         throw 'break';
    //       }
    //       if (control.controls[index].get('from_time').value < (formGroup?.get('from_time')?.value) && control.controls[index].get('to_time').value > (formGroup?.get('to_time')?.value)) {
    //         this.toasterService.showError('Please select time which should not overlap above time range', 'Asset Uptime')
    //         // event.target.value = ''
    //         control.controls[index].get('to_time').setValue('')
    //         throw 'break';
    //       }

    //     })
    //   }
    //   catch {

    //   }



    // }
  }

  onModalEvents(eventType) {
    if (eventType === 'save') {
      const control: any = this?.timeForm?.get('times') as FormArray
      control.removeAt(this.deleteIndex)
      this.asset_uptime_registry_id.splice(this.deleteIndex, 1)
      $("#confirmMessageModal").modal('hide');
    }
    else {
      $("#confirmMessageModal").modal('hide');
    }
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

}
