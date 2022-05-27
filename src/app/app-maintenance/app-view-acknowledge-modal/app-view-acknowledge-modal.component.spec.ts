import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppViewAcknowledgeModalComponent } from './app-view-acknowledge-modal.component';

describe('AppViewAcknowledgeModalComponent', () => {
  let component: AppViewAcknowledgeModalComponent;
  let fixture: ComponentFixture<AppViewAcknowledgeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppViewAcknowledgeModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppViewAcknowledgeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
