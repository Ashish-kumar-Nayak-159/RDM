import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationGatewayMonitoringComponent } from './application-gateway-monitoring.component';

describe('ApplicationGatewayMonitoringComponent', () => {
  let component: ApplicationGatewayMonitoringComponent;
  let fixture: ComponentFixture<ApplicationGatewayMonitoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationGatewayMonitoringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationGatewayMonitoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
