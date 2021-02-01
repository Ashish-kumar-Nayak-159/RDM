import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecificDirectMethodComponent } from './specific-direct-method.component';

describe('SpecificDirectMethodComponent', () => {
  let component: SpecificDirectMethodComponent;
  let fixture: ComponentFixture<SpecificDirectMethodComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificDirectMethodComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificDirectMethodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
