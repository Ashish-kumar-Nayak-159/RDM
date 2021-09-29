import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OnlyNumberWidgetComponent } from './only-number-widget.component';

describe('OnlyNumberWidgetComponent', () => {
  let component: OnlyNumberWidgetComponent;
  let fixture: ComponentFixture<OnlyNumberWidgetComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlyNumberWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlyNumberWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
