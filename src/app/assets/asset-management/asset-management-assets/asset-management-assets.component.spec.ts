import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetManagementAssetsComponent } from './asset-management-assets.component';

describe('AssetManagementAssetsComponent', () => {
  let component: AssetManagementAssetsComponent;
  let fixture: ComponentFixture<AssetManagementAssetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetManagementAssetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetManagementAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
