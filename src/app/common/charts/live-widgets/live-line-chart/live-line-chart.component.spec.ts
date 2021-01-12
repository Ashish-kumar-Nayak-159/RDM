import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveLineChartComponent } from './live-line-chart.component';

describe('LiveLineChartComponent', () => {
  let component: LiveLineChartComponent;
  let fixture: ComponentFixture<LiveLineChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveLineChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveLineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
