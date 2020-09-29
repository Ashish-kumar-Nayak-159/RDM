import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypePropertiesComponent } from './device-type-properties.component';

describe('DeviceTypePropertiesComponent', () => {
  let component: DeviceTypePropertiesComponent;
  let fixture: ComponentFixture<DeviceTypePropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypePropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
