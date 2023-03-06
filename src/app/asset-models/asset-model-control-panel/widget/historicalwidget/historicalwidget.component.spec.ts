import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricalwidgetComponent } from './historicalwidget.component';

describe('HistoricalwidgetComponent', () => {
  let component: HistoricalwidgetComponent;
  let fixture: ComponentFixture<HistoricalwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistoricalwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoricalwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
