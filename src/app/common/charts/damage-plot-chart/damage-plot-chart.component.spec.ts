import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DamagePlotChartComponent } from './damage-plot-chart.component';

describe('DamagePlotChartComponent', () => {
  let component: DamagePlotChartComponent;
  let fixture: ComponentFixture<DamagePlotChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DamagePlotChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DamagePlotChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
