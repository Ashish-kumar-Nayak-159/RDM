import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallNumberWidgetComponent } from './small-number-widget.component';

describe('SmallNumberWidgetComponent', () => {
  let component: SmallNumberWidgetComponent;
  let fixture: ComponentFixture<SmallNumberWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SmallNumberWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallNumberWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
