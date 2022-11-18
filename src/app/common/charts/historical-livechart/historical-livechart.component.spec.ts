import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalLivechartComponent } from './historical-livechart.component';

describe('HistoricalLivechartComponent', () => {
  let component: HistoricalLivechartComponent;
  let fixture: ComponentFixture<HistoricalLivechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricalLivechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalLivechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
