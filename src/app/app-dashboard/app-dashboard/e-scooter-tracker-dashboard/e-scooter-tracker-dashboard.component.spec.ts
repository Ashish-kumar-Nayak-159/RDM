import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EScooterTrackerDashboardComponent } from './e-scooter-tracker-dashboard.component';

describe('EScooterTrackerDashboardComponent', () => {
  let component: EScooterTrackerDashboardComponent;
  let fixture: ComponentFixture<EScooterTrackerDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EScooterTrackerDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EScooterTrackerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
