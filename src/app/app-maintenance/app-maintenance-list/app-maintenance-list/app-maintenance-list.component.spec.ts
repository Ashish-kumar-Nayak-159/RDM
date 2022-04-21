import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMaintenanceListComponent } from './app-maintenance-list.component';

describe('AppMaintenanceListComponent', () => {
  let component: AppMaintenanceListComponent;
  let fixture: ComponentFixture<AppMaintenanceListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppMaintenanceListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppMaintenanceListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
