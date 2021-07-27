import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAlertConditionsComponent } from './asset-alert-conditions.component';

describe('AssetAlertConditionsComponent', () => {
  let component: AssetAlertConditionsComponent;
  let fixture: ComponentFixture<AssetAlertConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetAlertConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetAlertConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
