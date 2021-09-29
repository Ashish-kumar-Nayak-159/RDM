import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelAlertAcknowledgementReasonsComponent } from './asset-model-alert-acknowledgement-reasons.component';

describe('AssetModelAlertAcknowledgementReasonsComponent', () => {
  let component: AssetModelAlertAcknowledgementReasonsComponent;
  let fixture: ComponentFixture<AssetModelAlertAcknowledgementReasonsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelAlertAcknowledgementReasonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelAlertAcknowledgementReasonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
