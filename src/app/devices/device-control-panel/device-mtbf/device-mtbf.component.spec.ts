import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMtbfComponent } from './device-mtbf.component';

describe('DeviceMtbfComponent', () => {
  let component: DeviceMtbfComponent;
  let fixture: ComponentFixture<DeviceMtbfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceMtbfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceMtbfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
