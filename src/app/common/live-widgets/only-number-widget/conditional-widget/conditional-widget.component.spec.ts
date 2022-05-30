import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalWidgetComponent } from './conditional-widget.component';

describe('ConditionalWidgetComponent', () => {
  let component: ConditionalWidgetComponent;
  let fixture: ComponentFixture<ConditionalWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionalWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionalWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
