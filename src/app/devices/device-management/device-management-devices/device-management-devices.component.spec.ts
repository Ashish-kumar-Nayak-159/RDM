import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManagementDevicesComponent } from './device-management-devices.component';

describe('DeviceManagementDevicesComponent', () => {
  let component: DeviceManagementDevicesComponent;
  let fixture: ComponentFixture<DeviceManagementDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceManagementDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceManagementDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
