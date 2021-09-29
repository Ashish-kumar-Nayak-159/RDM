import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddOnlyNumberWidgetComponent } from './add-only-number-widget.component';

describe('AddOnlyNumberWidgetComponent', () => {
  let component: AddOnlyNumberWidgetComponent;
  let fixture: ComponentFixture<AddOnlyNumberWidgetComponent>;

  beforeEach(waitForAsync(() => {
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
