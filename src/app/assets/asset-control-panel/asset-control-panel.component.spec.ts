import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetControlPanelComponent } from './asset-control-panel.component';

describe('AssetControlPanelComponent', () => {
  let component: AssetControlPanelComponent;
  let fixture: ComponentFixture<AssetControlPanelComponent>;

  beforeEach(async(() => {
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
