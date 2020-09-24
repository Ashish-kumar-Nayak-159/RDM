import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeListComponent } from './device-type-list.component';

describe('DeviceTypeListComponent', () => {
  let component: DeviceTypeListComponent;
  let fixture: ComponentFixture<DeviceTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
