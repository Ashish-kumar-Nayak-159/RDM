import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeJsonPacketFormatComponent } from './device-type-json-packet-format.component';

describe('DeviceTypeJsonPacketFormatComponent', () => {
  let component: DeviceTypeJsonPacketFormatComponent;
  let fixture: ComponentFixture<DeviceTypeJsonPacketFormatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeJsonPacketFormatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeJsonPacketFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
