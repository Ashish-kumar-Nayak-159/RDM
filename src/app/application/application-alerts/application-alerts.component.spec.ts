import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationAlertsComponent } from './application-alerts.component';

describe('ApplicationAlertsComponent', () => {
  let component: ApplicationAlertsComponent;
  let fixture: ComponentFixture<ApplicationAlertsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationAlertsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
