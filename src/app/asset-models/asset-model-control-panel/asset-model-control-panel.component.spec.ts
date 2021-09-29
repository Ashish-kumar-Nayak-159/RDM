import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelControlPanelComponent } from './asset-model-control-panel.component';

describe('AssetModelControlPanelComponent', () => {
  let component: AssetModelControlPanelComponent;
  let fixture: ComponentFixture<AssetModelControlPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelControlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
