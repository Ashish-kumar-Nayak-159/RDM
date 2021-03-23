import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeSettingsComponent } from './device-type-settings.component';

describe('DeviceTypeSettingsComponent', () => {
  let component: DeviceTypeSettingsComponent;
  let fixture: ComponentFixture<DeviceTypeSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
