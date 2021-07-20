import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayControlPanelComponent } from './gateway-control-panel.component';

describe('GatewayControlPanelComponent', () => {
  let component: GatewayControlPanelComponent;
  let fixture: ComponentFixture<GatewayControlPanelComponent>;

  beforeEach(async(() => {
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
