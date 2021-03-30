import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypePackageManagementComponent } from './device-type-package-management.component';

describe('DeviceTypePackageManagementComponent', () => {
  let component: DeviceTypePackageManagementComponent;
  let fixture: ComponentFixture<DeviceTypePackageManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypePackageManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypePackageManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
