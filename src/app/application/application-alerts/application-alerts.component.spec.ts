import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationAlertsComponent } from './application-alerts.component';

describe('ApplicationAlertsComponent', () => {
  let component: ApplicationAlertsComponent;
  let fixture: ComponentFixture<ApplicationAlertsComponent>;

  beforeEach(async(() => {
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
