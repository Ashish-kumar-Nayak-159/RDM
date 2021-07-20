import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GatewayConfigurationHistoryComponent } from './gateway-configuration-history.component';

describe('GatewayConfigurationHistoryComponent', () => {
  let component: GatewayConfigurationHistoryComponent;
  let fixture: ComponentFixture<GatewayConfigurationHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GatewayConfigurationHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GatewayConfigurationHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
