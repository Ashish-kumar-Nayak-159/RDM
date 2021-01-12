import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveColumnChartComponent } from './live-column-chart.component';

describe('LiveColumnChartComponent', () => {
  let component: LiveColumnChartComponent;
  let fixture: ComponentFixture<LiveColumnChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveColumnChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveColumnChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
