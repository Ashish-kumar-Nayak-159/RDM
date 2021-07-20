import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelHistoryLayoutComponent } from './asset-model-history-layout.component';

describe('AssetModelHistoryLayoutComponent', () => {
  let component: AssetModelHistoryLayoutComponent;
  let fixture: ComponentFixture<AssetModelHistoryLayoutComponent>;

  beforeEach(async(() => {
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
