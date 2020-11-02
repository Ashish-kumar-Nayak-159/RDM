import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictiveMaintenanceComponent } from './predictive-maintenance.component';

describe('PredictiveMaintenanceComponent', () => {
  let component: PredictiveMaintenanceComponent;
  let fixture: ComponentFixture<PredictiveMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PredictiveMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictiveMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
