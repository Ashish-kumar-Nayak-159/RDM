import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveBarChartComponent } from './live-bar-chart.component';

describe('LiveBarChartComponent', () => {
  let component: LiveBarChartComponent;
  let fixture: ComponentFixture<LiveBarChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveBarChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveBarChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
