import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelLiveLayoutComponent } from './asset-model-live-layout.component';

describe('AssetModelLiveLayoutComponent', () => {
  let component: AssetModelLiveLayoutComponent;
  let fixture: ComponentFixture<AssetModelLiveLayoutComponent>;

  beforeEach(async(() => {
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
