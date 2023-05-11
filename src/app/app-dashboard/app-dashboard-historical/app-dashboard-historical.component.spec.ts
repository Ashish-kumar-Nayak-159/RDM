import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDashboardHistoricalComponent } from './app-dashboard-historical.component';

describe('AppDashboardHistoricalComponent', () => {
  let component: AppDashboardHistoricalComponent;
  let fixture: ComponentFixture<AppDashboardHistoricalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppDashboardHistoricalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppDashboardHistoricalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
