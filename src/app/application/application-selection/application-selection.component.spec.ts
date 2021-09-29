import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationSelectionComponent } from './application-selection.component';

describe('ApplicationSelectionComponent', () => {
  let component: ApplicationSelectionComponent;
  let fixture: ComponentFixture<ApplicationSelectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationSelectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
