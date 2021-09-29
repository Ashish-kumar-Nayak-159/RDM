import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatewayCurrentConfigurationComponent } from './gateway-current-configuration.component';

describe('GatewayCurrentConfigurationComponent', () => {
  let component: GatewayCurrentConfigurationComponent;
  let fixture: ComponentFixture<GatewayCurrentConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayCurrentConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayCurrentConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
