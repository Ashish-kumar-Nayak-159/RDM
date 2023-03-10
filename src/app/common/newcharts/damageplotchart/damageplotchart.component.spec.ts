import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamageplotchartComponent } from './damageplotchart.component';

describe('DamageplotchartComponent', () => {
  let component: DamageplotchartComponent;
  let fixture: ComponentFixture<DamageplotchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DamageplotchartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DamageplotchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
