import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeLiveLayoutComponent } from './device-type-live-layout.component';

describe('DeviceTypeLiveLayoutComponent', () => {
  let component: DeviceTypeLiveLayoutComponent;
  let fixture: ComponentFixture<DeviceTypeLiveLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeLiveLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeLiveLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
