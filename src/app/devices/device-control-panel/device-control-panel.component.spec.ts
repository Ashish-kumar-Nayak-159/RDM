import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceControlPanelComponent } from './device-control-panel.component';

describe('DeviceControlPanelComponent', () => {
  let component: DeviceControlPanelComponent;
  let fixture: ComponentFixture<DeviceControlPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceControlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
