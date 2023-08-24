import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetControlPropertiesComponent } from './asset-control-properties.component';

describe('AssetControlPropertiesComponent', () => {
  let component: AssetControlPropertiesComponent;
  let fixture: ComponentFixture<AssetControlPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetControlPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetControlPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
