import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelAlertConditionsComponent } from './asset-model-alert-conditions.component';

describe('AssetModelAlertConditionsComponent', () => {
  let component: AssetModelAlertConditionsComponent;
  let fixture: ComponentFixture<AssetModelAlertConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelAlertConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelAlertConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
