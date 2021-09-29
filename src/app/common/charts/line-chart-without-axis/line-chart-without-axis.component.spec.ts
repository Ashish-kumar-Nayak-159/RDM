import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LineChartWithoutAxisComponent } from './line-chart-without-axis.component';

describe('LineChartWithoutAxisComponent', () => {
  let component: LineChartWithoutAxisComponent;
  let fixture: ComponentFixture<LineChartWithoutAxisComponent>;

  beforeEach(waitForAsync(() => {
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
