import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelRulesComponent } from './asset-model-rules.component';

describe('AssetModelRulesComponent', () => {
  let component: AssetModelRulesComponent;
  let fixture: ComponentFixture<AssetModelRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelRulesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
