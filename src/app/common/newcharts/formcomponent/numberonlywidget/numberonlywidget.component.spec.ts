import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberonlywidgetComponent } from './numberonlywidget.component';

describe('NumberonlywidgetComponent', () => {
  let component: NumberonlywidgetComponent;
  let fixture: ComponentFixture<NumberonlywidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberonlywidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberonlywidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
