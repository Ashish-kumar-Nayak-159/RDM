import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectanglewidgetComponent } from './rectanglewidget.component';

describe('RectanglewidgetComponent', () => {
  let component: RectanglewidgetComponent;
  let fixture: ComponentFixture<RectanglewidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RectanglewidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RectanglewidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
