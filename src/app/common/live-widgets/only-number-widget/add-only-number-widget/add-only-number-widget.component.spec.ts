import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnlyNumberWidgetComponent } from './add-only-number-widget.component';

describe('AddOnlyNumberWidgetComponent', () => {
  let component: AddOnlyNumberWidgetComponent;
  let fixture: ComponentFixture<AddOnlyNumberWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddOnlyNumberWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddOnlyNumberWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
