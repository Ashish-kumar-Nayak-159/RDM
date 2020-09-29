import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeControlPanelComponent } from './device-type-control-panel.component';

describe('DeviceTypeControlPanelComponent', () => {
  let component: DeviceTypeControlPanelComponent;
  let fixture: ComponentFixture<DeviceTypeControlPanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeControlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
