import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePackagesComponent } from './device-packages.component';

describe('DevicePackagesComponent', () => {
  let component: DevicePackagesComponent;
  let fixture: ComponentFixture<DevicePackagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePackagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
