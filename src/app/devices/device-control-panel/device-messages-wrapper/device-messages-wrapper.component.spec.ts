import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMessagesWrapperComponent } from './device-messages-wrapper.component';

describe('DeviceMessagesWrapperComponent', () => {
  let component: DeviceMessagesWrapperComponent;
  let fixture: ComponentFixture<DeviceMessagesWrapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceMessagesWrapperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceMessagesWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
