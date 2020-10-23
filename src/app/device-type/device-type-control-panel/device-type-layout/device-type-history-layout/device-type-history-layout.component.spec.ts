import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeHistoryLayoutComponent } from './device-type-history-layout.component';

describe('DeviceTypeHistoryLayoutComponent', () => {
  let component: DeviceTypeHistoryLayoutComponent;
  let fixture: ComponentFixture<DeviceTypeHistoryLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeHistoryLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeHistoryLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
