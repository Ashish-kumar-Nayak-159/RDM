import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DerivedKpisComponent } from './derived-kpis.component';

describe('DerivedKpisComponent', () => {
  let component: DerivedKpisComponent;
  let fixture: ComponentFixture<DerivedKpisComponent>;

  beforeEach(waitForAsync(() => {
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
