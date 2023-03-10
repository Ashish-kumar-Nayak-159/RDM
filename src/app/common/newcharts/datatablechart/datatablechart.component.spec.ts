import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatatablechartComponent } from './datatablechart.component';

describe('DatatablechartComponent', () => {
  let component: DatatablechartComponent;
  let fixture: ComponentFixture<DatatablechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatatablechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatablechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
