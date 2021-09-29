import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NonProvisionedAssetsComponent } from './non-provisioned-assets.component';

describe('NonProvisionedAssetsComponent', () => {
  let component: NonProvisionedAssetsComponent;
  let fixture: ComponentFixture<NonProvisionedAssetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NonProvisionedAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NonProvisionedAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
