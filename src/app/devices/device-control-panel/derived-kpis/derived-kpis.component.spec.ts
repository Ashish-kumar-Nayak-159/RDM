import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DerivedKpisComponent } from './derived-kpis.component';

describe('DerivedKpisComponent', () => {
  let component: DerivedKpisComponent;
  let fixture: ComponentFixture<DerivedKpisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DerivedKpisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DerivedKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
