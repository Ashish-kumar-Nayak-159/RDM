import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeAlertConditionsComponent } from './device-type-alert-conditions.component';

describe('DeviceTypeAlertConditionsComponent', () => {
  let component: DeviceTypeAlertConditionsComponent;
  let fixture: ComponentFixture<DeviceTypeAlertConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeAlertConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeAlertConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
