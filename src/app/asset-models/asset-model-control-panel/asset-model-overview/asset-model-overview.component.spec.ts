import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelOverviewComponent } from './asset-model-overview.component';

describe('AssetModelOverviewComponent', () => {
  let component: AssetModelOverviewComponent;
  let fixture: ComponentFixture<AssetModelOverviewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
