import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceCountComponent } from './device-count.component';

describe('DeviceCountComponent', () => {
  let component: DeviceCountComponent;
  let fixture: ComponentFixture<DeviceCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
