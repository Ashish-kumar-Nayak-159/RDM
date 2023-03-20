import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CylinderwidgetComponent } from './cylinderwidget.component';

describe('CylinderwidgetComponent', () => {
  let component: CylinderwidgetComponent;
  let fixture: ComponentFixture<CylinderwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CylinderwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CylinderwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
