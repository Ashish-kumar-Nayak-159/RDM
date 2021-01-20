import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewaySettingsComponent } from './gateway-settings.component';

describe('GatewaySettingsComponent', () => {
  let component: GatewaySettingsComponent;
  let fixture: ComponentFixture<GatewaySettingsComponent>;

  beforeEach(async(() => {
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
