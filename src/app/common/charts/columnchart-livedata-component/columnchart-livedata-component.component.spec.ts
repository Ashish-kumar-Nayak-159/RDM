import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnchartLivedataComponentComponent } from './columnchart-livedata-component.component';

describe('ColumnchartLivedataComponentComponent', () => {
  let component: ColumnchartLivedataComponentComponent;
  let fixture: ComponentFixture<ColumnchartLivedataComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColumnchartLivedataComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnchartLivedataComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
