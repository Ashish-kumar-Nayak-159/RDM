import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelPropertiesComponent } from './asset-model-properties.component';

describe('AssetModelPropertiesComponent', () => {
  let component: AssetModelPropertiesComponent;
  let fixture: ComponentFixture<AssetModelPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
