import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayDevicesSettingComponent } from './gateway-devices-setting.component';

describe('GatewayDevicesSettingComponent', () => {
  let component: GatewayDevicesSettingComponent;
  let fixture: ComponentFixture<GatewayDevicesSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayDevicesSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayDevicesSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
