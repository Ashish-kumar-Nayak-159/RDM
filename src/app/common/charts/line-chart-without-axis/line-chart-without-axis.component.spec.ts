import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartWithoutAxisComponent } from './line-chart-without-axis.component';

describe('LineChartWithoutAxisComponent', () => {
  let component: LineChartWithoutAxisComponent;
  let fixture: ComponentFixture<LineChartWithoutAxisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartWithoutAxisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartWithoutAxisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
