import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMaintenanceComponent } from './device-maintenance.component';

describe('DeviceMaintenanceComponent', () => {
  let component: DeviceMaintenanceComponent;
  let fixture: ComponentFixture<DeviceMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
