import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeSlaveInfoComponent } from './device-type-slave-info.component';

describe('DeviceTypeSlaveInfoComponent', () => {
  let component: DeviceTypeSlaveInfoComponent;
  let fixture: ComponentFixture<DeviceTypeSlaveInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeSlaveInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeSlaveInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
