import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceLifeCycleEventsComponent } from './device-life-cycle-events.component';

describe('DeviceLifeCycleEventsComponent', () => {
  let component: DeviceLifeCycleEventsComponent;
  let fixture: ComponentFixture<DeviceLifeCycleEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceLifeCycleEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceLifeCycleEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
