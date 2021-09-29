import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GatewayControlPanelComponent } from './gateway-control-panel.component';

describe('GatewayControlPanelComponent', () => {
  let component: GatewayControlPanelComponent;
  let fixture: ComponentFixture<GatewayControlPanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayControlPanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayControlPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
