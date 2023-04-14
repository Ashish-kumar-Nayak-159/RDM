import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberonlywidgetLogicalviewComponent } from './numberonlywidget-logicalview.component';

describe('NumberonlywidgetLogicalviewComponent', () => {
  let component: NumberonlywidgetLogicalviewComponent;
  let fixture: ComponentFixture<NumberonlywidgetLogicalviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberonlywidgetLogicalviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberonlywidgetLogicalviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
