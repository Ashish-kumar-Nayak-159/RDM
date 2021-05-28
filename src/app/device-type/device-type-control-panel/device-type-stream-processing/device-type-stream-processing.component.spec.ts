import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeStreamProcessingComponent } from './device-type-stream-processing.component';

describe('DeviceTypeStreamProcessingComponent', () => {
  let component: DeviceTypeStreamProcessingComponent;
  let fixture: ComponentFixture<DeviceTypeStreamProcessingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeStreamProcessingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeStreamProcessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
