import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelSettingsComponent } from './asset-model-settings.component';

describe('AssetModelSettingsComponent', () => {
  let component: AssetModelSettingsComponent;
  let fixture: ComponentFixture<AssetModelSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
