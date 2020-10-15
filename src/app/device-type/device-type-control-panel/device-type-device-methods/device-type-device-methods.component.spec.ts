import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeDeviceMethodsComponent } from './device-type-device-methods.component';

describe('DeviceTypeDeviceMethodsComponent', () => {
  let component: DeviceTypeDeviceMethodsComponent;
  let fixture: ComponentFixture<DeviceTypeDeviceMethodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeDeviceMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeDeviceMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
