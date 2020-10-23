import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaterTankMonitorComponent } from './water-tank-monitor.component';

describe('WaterTankMonitorComponent', () => {
  let component: WaterTankMonitorComponent;
  let fixture: ComponentFixture<WaterTankMonitorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WaterTankMonitorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaterTankMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
