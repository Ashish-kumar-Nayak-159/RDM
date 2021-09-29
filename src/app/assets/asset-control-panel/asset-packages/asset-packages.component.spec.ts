import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetPackagesComponent } from './asset-packages.component';

describe('AssetPackagesComponent', () => {
  let component: AssetPackagesComponent;
  let fixture: ComponentFixture<AssetPackagesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetPackagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetPackagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
