import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetModelDeviceMethodsComponent } from './asset-model-device-methods.component';

describe('AssetModelDeviceMethodsComponent', () => {
  let component: AssetModelDeviceMethodsComponent;
  let fixture: ComponentFixture<AssetModelDeviceMethodsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetModelDeviceMethodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetModelDeviceMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
