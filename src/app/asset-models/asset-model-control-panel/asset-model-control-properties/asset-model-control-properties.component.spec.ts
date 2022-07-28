import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetModelControlPropertiesComponent } from './asset-model-control-properties.component';

describe('AssetModelControlPropertiesComponent', () => {
  let component: AssetModelControlPropertiesComponent;
  let fixture: ComponentFixture<AssetModelControlPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetModelControlPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelControlPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
