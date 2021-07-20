import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertEndEventComponent } from './alert-end-event.component';

describe('AlertEndEventComponent', () => {
  let component: AlertEndEventComponent;
  let fixture: ComponentFixture<AlertEndEventComponent>;

  beforeEach(async(() => {
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
