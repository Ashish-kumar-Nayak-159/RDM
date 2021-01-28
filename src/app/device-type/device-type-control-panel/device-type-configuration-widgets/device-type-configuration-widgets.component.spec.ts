import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeConfigurationWidgetsComponent } from './device-type-configuration-widgets.component';

describe('DeviceTypeConfigurationWidgetsComponent', () => {
  let component: DeviceTypeConfigurationWidgetsComponent;
  let fixture: ComponentFixture<DeviceTypeConfigurationWidgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeConfigurationWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeConfigurationWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
