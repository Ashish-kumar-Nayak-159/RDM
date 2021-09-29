import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RDMAssetControlPanelErrorComponent } from './rdmasset-control-panel-error.component';

describe('RDMAssetControlPanelErrorComponent', () => {
  let component: RDMAssetControlPanelErrorComponent;
  let fixture: ComponentFixture<RDMAssetControlPanelErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RDMAssetControlPanelErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RDMAssetControlPanelErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
