import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionalwidgetComponent } from './conditionalwidget.component';

describe('ConditionalwidgetComponent', () => {
  let component: ConditionalwidgetComponent;
  let fixture: ComponentFixture<ConditionalwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConditionalwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionalwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
