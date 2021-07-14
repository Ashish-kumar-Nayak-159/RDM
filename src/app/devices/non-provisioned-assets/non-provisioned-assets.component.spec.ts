import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NonProvisionedAssetsComponent } from './non-provisioned-assets.component';

describe('NonProvisionedAssetsComponent', () => {
  let component: NonProvisionedAssetsComponent;
  let fixture: ComponentFixture<NonProvisionedAssetsComponent>;

  beforeEach(async(() => {
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
