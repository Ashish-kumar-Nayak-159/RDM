import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppEscalationModalComponent } from './app-escalation-modal.component';

describe('AppEscalationModalComponent', () => {
  let component: AppEscalationModalComponent;
  let fixture: ComponentFixture<AppEscalationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppEscalationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppEscalationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
