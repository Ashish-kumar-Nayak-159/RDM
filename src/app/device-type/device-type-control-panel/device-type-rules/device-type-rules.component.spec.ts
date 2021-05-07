import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeRulesComponent } from './device-type-rules.component';

describe('DeviceTypeRulesComponent', () => {
  let component: DeviceTypeRulesComponent;
  let fixture: ComponentFixture<DeviceTypeRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
