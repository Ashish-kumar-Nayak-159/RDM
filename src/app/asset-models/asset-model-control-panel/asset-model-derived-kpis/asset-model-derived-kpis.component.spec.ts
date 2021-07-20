import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelDerivedKpisComponent } from './asset-model-derived-kpis.component';

describe('AssetModelDerivedKpisComponent', () => {
  let component: AssetModelDerivedKpisComponent;
  let fixture: ComponentFixture<AssetModelDerivedKpisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelDerivedKpisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelDerivedKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
