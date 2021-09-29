import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelRulesComponent } from './asset-model-rules.component';

describe('AssetModelRulesComponent', () => {
  let component: AssetModelRulesComponent;
  let fixture: ComponentFixture<AssetModelRulesComponent>;

  beforeEach(waitForAsync(() => {
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
