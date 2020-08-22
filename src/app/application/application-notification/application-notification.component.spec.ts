import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationNotificationComponent } from './application-notification.component';

describe('ApplicationNotificationComponent', () => {
  let component: ApplicationNotificationComponent;
  let fixture: ComponentFixture<ApplicationNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
