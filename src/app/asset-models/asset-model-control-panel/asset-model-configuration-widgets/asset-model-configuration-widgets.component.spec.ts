import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelConfigurationWidgetsComponent } from './asset-model-configuration-widgets.component';

describe('AssetModelConfigurationWidgetsComponent', () => {
  let component: AssetModelConfigurationWidgetsComponent;
  let fixture: ComponentFixture<AssetModelConfigurationWidgetsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelConfigurationWidgetsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelConfigurationWidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
