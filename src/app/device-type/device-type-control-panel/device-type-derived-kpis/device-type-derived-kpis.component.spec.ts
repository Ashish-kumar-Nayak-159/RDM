import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeDerivedKpisComponent } from './device-type-derived-kpis.component';

describe('DeviceTypeDerivedKpisComponent', () => {
  let component: DeviceTypeDerivedKpisComponent;
  let fixture: ComponentFixture<DeviceTypeDerivedKpisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeDerivedKpisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeDerivedKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
