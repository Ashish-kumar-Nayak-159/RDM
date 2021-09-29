import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelControlWidgetsComponent } from './asset-model-control-widgets.component';

describe('AssetModelControlWidgetsComponent', () => {
  let component: AssetModelControlWidgetsComponent;
  let fixture: ComponentFixture<AssetModelControlWidgetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelControlWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelControlWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
