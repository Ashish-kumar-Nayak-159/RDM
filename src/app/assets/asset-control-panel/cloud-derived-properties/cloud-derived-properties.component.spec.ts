import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloudDerivedPropertiesComponent } from './cloud-derived-properties.component';

describe('CloudDerivedPropertiesComponent', () => {
  let component: CloudDerivedPropertiesComponent;
  let fixture: ComponentFixture<CloudDerivedPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloudDerivedPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudDerivedPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
