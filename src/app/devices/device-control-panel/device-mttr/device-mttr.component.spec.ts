import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMttrComponent } from './device-mttr.component';

describe('DeviceMttrComponent', () => {
  let component: DeviceMttrComponent;
  let fixture: ComponentFixture<DeviceMttrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceMttrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceMttrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
