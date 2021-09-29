import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelHistoryLayoutComponent } from './asset-model-history-layout.component';

describe('AssetModelHistoryLayoutComponent', () => {
  let component: AssetModelHistoryLayoutComponent;
  let fixture: ComponentFixture<AssetModelHistoryLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelHistoryLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelHistoryLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
