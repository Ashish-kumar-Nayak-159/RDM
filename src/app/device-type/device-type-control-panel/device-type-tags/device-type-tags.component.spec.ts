import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeTagsComponent } from './device-type-tags.component';

describe('DeviceTypeTagsComponent', () => {
  let component: DeviceTypeTagsComponent;
  let fixture: ComponentFixture<DeviceTypeTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
