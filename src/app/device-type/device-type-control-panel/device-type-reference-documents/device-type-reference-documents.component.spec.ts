import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceTypeReferenceDocumentsComponent } from './device-type-reference-documents.component';

describe('DeviceTypeReferenceDocumentsComponent', () => {
  let component: DeviceTypeReferenceDocumentsComponent;
  let fixture: ComponentFixture<DeviceTypeReferenceDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeviceTypeReferenceDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceTypeReferenceDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
