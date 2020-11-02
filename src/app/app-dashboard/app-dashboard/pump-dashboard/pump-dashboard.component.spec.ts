import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpDashboardComponent } from './pump-dashboard.component';

describe('PumpDashboardComponent', () => {
  let component: PumpDashboardComponent;
  let fixture: ComponentFixture<PumpDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
