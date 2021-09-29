import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetManagementComponent } from './asset-management.component';

describe('AssetManagementComponent', () => {
  let component: AssetManagementComponent;
  let fixture: ComponentFixture<AssetManagementComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
