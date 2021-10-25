import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CylinderWidgetComponent } from './cylinder-widget.component';

describe('CylinderWidgetComponent', () => {
  let component: CylinderWidgetComponent;
  let fixture: ComponentFixture<CylinderWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CylinderWidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CylinderWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
