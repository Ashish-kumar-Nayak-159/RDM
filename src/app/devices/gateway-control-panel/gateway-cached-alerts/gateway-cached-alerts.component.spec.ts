import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayCachedAlertsComponent } from './gateway-cached-alerts.component';

describe('GatewayCachedAlertsComponent', () => {
  let component: GatewayCachedAlertsComponent;
  let fixture: ComponentFixture<GatewayCachedAlertsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayCachedAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayCachedAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
