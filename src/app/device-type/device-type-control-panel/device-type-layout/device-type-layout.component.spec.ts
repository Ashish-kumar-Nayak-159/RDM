import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeLayoutComponent } from './device-type-layout.component';

describe('DeviceTypeLayoutComponent', () => {
  let component: DeviceTypeLayoutComponent;
  let fixture: ComponentFixture<DeviceTypeLayoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
