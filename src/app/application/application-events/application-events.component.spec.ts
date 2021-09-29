import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationEventsComponent } from './application-events.component';

describe('ApplicationEventsComponent', () => {
  let component: ApplicationEventsComponent;
  let fixture: ComponentFixture<ApplicationEventsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
