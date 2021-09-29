import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationNotificationsComponent } from './application-notifications.component';

describe('ApplicationNotificationsComponent', () => {
  let component: ApplicationNotificationsComponent;
  let fixture: ComponentFixture<ApplicationNotificationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
