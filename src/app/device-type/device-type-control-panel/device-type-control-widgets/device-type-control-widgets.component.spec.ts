import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeControlWidgetsComponent } from './device-type-control-widgets.component';

describe('DeviceTypeControlWidgetsComponent', () => {
  let component: DeviceTypeControlWidgetsComponent;
  let fixture: ComponentFixture<DeviceTypeControlWidgetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeControlWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeControlWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
