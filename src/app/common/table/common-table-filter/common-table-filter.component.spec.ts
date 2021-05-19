import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonTableFilterComponent } from './common-table-filter.component';

describe('CommonTableFilterComponent', () => {
  let component: CommonTableFilterComponent;
  let fixture: ComponentFixture<CommonTableFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTableFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTableFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
