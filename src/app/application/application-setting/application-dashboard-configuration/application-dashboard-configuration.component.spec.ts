import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDashboardConfigurationComponent } from './application-dashboard-configuration.component';

describe('ApplicationDashboardConfigurationComponent', () => {
  let component: ApplicationDashboardConfigurationComponent;
  let fixture: ComponentFixture<ApplicationDashboardConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationDashboardConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDashboardConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
