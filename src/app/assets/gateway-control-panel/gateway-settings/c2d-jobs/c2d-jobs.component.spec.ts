import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { C2dJobsComponent } from './c2d-jobs.component';

describe('C2dJobsComponent', () => {
  let component: C2dJobsComponent;
  let fixture: ComponentFixture<C2dJobsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ C2dJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(C2dJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
