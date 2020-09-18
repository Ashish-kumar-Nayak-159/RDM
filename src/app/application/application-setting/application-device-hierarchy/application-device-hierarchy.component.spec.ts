import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDeviceHierarchyComponent } from './application-device-hierarchy.component';

describe('ApplicationDeviceHierarchyComponent', () => {
  let component: ApplicationDeviceHierarchyComponent;
  let fixture: ComponentFixture<ApplicationDeviceHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationDeviceHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDeviceHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
