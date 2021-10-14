import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HierarchyDropdownComponent } from './hierarchy-dropdown.component';

describe('HierarchyDropdownComponent', () => {
  let component: HierarchyDropdownComponent;
  let fixture: ComponentFixture<HierarchyDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HierarchyDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HierarchyDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
