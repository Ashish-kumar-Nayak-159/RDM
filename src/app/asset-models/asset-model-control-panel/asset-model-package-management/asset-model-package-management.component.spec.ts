import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelPackageManagementComponent } from './asset-model-package-management.component';

describe('AssetModelPackageManagementComponent', () => {
  let component: AssetModelPackageManagementComponent;
  let fixture: ComponentFixture<AssetModelPackageManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelPackageManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelPackageManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
