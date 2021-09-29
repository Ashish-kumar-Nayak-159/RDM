import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AlertEndEventComponent } from './alert-end-event.component';

describe('AlertEndEventComponent', () => {
  let component: AlertEndEventComponent;
  let fixture: ComponentFixture<AlertEndEventComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertEndEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertEndEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
