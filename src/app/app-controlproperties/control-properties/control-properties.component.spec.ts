import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlPropertiesComponent } from './control-properties.component';

describe('ControlPropertiesComponent', () => {
  let component: ControlPropertiesComponent;
  let fixture: ComponentFixture<ControlPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlPropertiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
