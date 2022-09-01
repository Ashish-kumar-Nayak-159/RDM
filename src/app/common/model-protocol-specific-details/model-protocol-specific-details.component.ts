import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-model-protocol-specific-details',
  templateUrl: './model-protocol-specific-details.component.html',
  styleUrls: ['./model-protocol-specific-details.component.css'],
})
export class ModelProtocolSpecificDetailsComponent implements OnInit {
  @Input() setupForm: FormGroup;
  @Input() slaveData: any[] = [];
  @Input() assetModel: any;
  @Input() propertyObj : any;
  @Input() pageType = 'add'; // add or edit
  @Input() dataObj: any;
  constructor() {}

  ngOnInit(): void {
    if (this.pageType === 'edit') {
      if (this.assetModel.tags.protocol === 'ModbusTCPMaster' || this.assetModel.tags.protocol === 'ModbusRTUMaster') {
        this.onChangeOfSetupType(this.dataObj);
        this.onChangeOfSetupSecondaryType(this.dataObj);
        this.onChangeOfSetupFunctionCode(this.dataObj);
      }
      if (this.assetModel.tags.protocol === 'SiemensTCPIP') {
        this.onChangeOfSetupType(this.dataObj);
        this.onChangeOfSetupSecondaryType(this.dataObj);
        this.onChageOfMemoryType(this.dataObj);
      }
      if (this.assetModel.tags.protocol === 'AIoTInputs') {
        this.onAIoTTypeChange(this.dataObj);
      }
      if (this.assetModel.tags.protocol === 'BlueNRG') {
        this.onChangeOfBlueNRGValueType(this.dataObj);
      }
    }
  }

  onAIoTTypeChange(obj = undefined) {
    if (this.setupForm.value.d === 'a') {
      this.setupForm.removeControl('p');
      this.setupForm.addControl(
        'p',
        new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)])
      );
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
  }

  onChangeOfSetupType(obj = undefined) {
    if (this.setupForm.value.d !== 'a') {
      this.setupForm.removeControl('sd');
    } else {
      this.setupForm.addControl('sd', new FormControl(obj?.sd || null, [Validators.required]));
    }
    if (this.setupForm.value.d !== 's') {
      this.setupForm.removeControl('la');
    } else {
      this.setupForm.addControl(
        'la',
        new FormControl(obj?.la || null, [Validators.required, Validators.min(1), Validators.max(99999)])
      );
    }
    if (this.setupForm.value.d === 'a' && (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl(
        'p',
        new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)])
      );
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
    if (this.assetModel.tags.protocol === 'SiemensTCPIP' && this.setupForm.value.d === 'd') {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl(
        'bn',
        new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)])
      );
    } else {
      this.setupForm.removeControl('bn');
    }

    if (this.setupForm.value.d === 'd' && (this.setupForm.value.fc_r === 3 || this.setupForm.value.fc_r === 4)) {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl(
        'bn',
        new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)])
      );
    } else {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(-1, []));
      this.setupForm.get('bn').setValidators([]); // or clearValidators()
      this.setupForm.get('bn').setValue(null);
      this.setupForm.get('bn').updateValueAndValidity();
    }

    if (this.setupForm.value.d === 'd' && (this.setupForm.value.fc_w === 5)) {
      this.setupForm.get('fc_w').setValue(null);
      this.setupForm.get('fc_w').updateValueAndValidity();
    }
  }

  onChangeOfSetupSecondaryType(obj = undefined) {
    if (this.setupForm.value.d === 'a' && (this.setupForm.value.sd === 5 || this.setupForm.value.sd === 6)) {
      this.setupForm.removeControl('p');
      this.setupForm.addControl(
        'p',
        new FormControl(obj?.p || null, [Validators.required, Validators.min(1), Validators.max(5)])
      );
    } else {
      this.setupForm.removeControl('p');
      this.setupForm.addControl('p', new FormControl(0, [Validators.required]));
    }
    if (this.setupForm.value.d === 'a' && this.setupForm.value.sd === 9) {
      this.setupForm.removeControl('bytn');
      this.setupForm.addControl('bytn', new FormControl(obj?.bytn || null, [Validators.required]));
    } else {
      this.setupForm.removeControl('bytn');
    }
  }

  onChageOfMemoryType(obj = undefined) {
    if (this.setupForm.value.mt === 'DB') {
      this.setupForm.addControl('dbn', new FormControl(obj?.dbn || null, [Validators.required, Validators.min(1)]));
    } else {
      this.setupForm.removeControl('dbn');
    }
  }

  onChangeOfBlueNRGValueType(obj = undefined) {
    if (this.setupForm.value.t === 2) {
      this.setupForm.addControl('pt', new FormControl(obj?.pt || null, [Validators.required, Validators.min(1)]));
    } else {
      this.setupForm.removeControl('pt');
    }
  }

  onChangeOfSetupFunctionCode(obj = undefined) {
    if (this.setupForm.value.d === 'd' && (this.setupForm.value.fc_r === 3 || this.setupForm.value.fc_r === 4)) {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl(
        'bn',
        new FormControl(obj?.bn || null, [Validators.required, Validators.min(0), Validators.max(15)])
      );
    } else {
      this.setupForm.removeControl('bn');
      this.setupForm.addControl('bn', new FormControl(-1, []));
      this.setupForm.get('bn').setValidators([]); // or clearValidators()
      this.setupForm.get('bn').setValue(null);
      this.setupForm.get('bn').updateValueAndValidity();
    }
  }
  onChangeOfWriteSetupFunctionCode(obj = undefined) {}
}
