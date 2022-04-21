import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMaintenanceComponent } from './app-maintenance.component';

describe('AppMaintenanceComponent', () => {
  let component: AppMaintenanceComponent;
  let fixture: ComponentFixture<AppMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppMaintenanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
