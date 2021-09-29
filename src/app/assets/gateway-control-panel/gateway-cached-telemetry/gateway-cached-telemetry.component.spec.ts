import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatewayCachedTelemetryComponent } from './gateway-cached-telemetry.component';

describe('GatewayCachedTelemetryComponent', () => {
  let component: GatewayCachedTelemetryComponent;
  let fixture: ComponentFixture<GatewayCachedTelemetryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayCachedTelemetryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayCachedTelemetryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
