import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatewaySettingsComponent } from './gateway-settings.component';

describe('GatewaySettingsComponent', () => {
  let component: GatewaySettingsComponent;
  let fixture: ComponentFixture<GatewaySettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewaySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewaySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
