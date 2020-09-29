import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeOverviewComponent } from './device-type-overview.component';

describe('DeviceTypeOverviewComponent', () => {
  let component: DeviceTypeOverviewComponent;
  let fixture: ComponentFixture<DeviceTypeOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
