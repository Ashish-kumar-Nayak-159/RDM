import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatewayAssetsSettingComponent } from './gateway-assets-setting.component';

describe('GatewayAssetsSettingComponent', () => {
  let component: GatewayAssetsSettingComponent;
  let fixture: ComponentFixture<GatewayAssetsSettingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayAssetsSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayAssetsSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
