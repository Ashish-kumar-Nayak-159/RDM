import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetControlPanelComponent } from './asset-control-panel.component';

describe('AssetControlPanelComponent', () => {
  let component: AssetControlPanelComponent;
  let fixture: ComponentFixture<AssetControlPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetControlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
