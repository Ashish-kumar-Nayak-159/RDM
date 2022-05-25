import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMaintenanceModalComponent } from './app-maintenance-modal.component';

describe('AppMaintenanceModalComponent', () => {
  let component: AppMaintenanceModalComponent;
  let fixture: ComponentFixture<AppMaintenanceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppMaintenanceModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMaintenanceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
