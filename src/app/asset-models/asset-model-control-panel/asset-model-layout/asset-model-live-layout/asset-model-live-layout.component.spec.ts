import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelLiveLayoutComponent } from './asset-model-live-layout.component';

describe('AssetModelLiveLayoutComponent', () => {
  let component: AssetModelLiveLayoutComponent;
  let fixture: ComponentFixture<AssetModelLiveLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelLiveLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelLiveLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
