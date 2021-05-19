import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonMultiSelectDropdownComponent } from './common-multi-select-dropdown.component';

describe('CommonMultiSelectDropdownComponent', () => {
  let component: CommonMultiSelectDropdownComponent;
  let fixture: ComponentFixture<CommonMultiSelectDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonMultiSelectDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonMultiSelectDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
