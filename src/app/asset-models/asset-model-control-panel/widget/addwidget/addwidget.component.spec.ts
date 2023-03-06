import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddwidgetComponent } from './addwidget.component';

describe('AddwidgetComponent', () => {
  let component: AddwidgetComponent;
  let fixture: ComponentFixture<AddwidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddwidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddwidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
