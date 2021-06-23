import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeAlertAcknowledgementReasonsComponent } from './device-type-alert-acknowledgement-reasons.component';

describe('DeviceTypeAlertAcknowledgementReasonsComponent', () => {
  let component: DeviceTypeAlertAcknowledgementReasonsComponent;
  let fixture: ComponentFixture<DeviceTypeAlertAcknowledgementReasonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeAlertAcknowledgementReasonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeAlertAcknowledgementReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
