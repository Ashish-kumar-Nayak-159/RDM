import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RegisterPropertiesComponent } from './register-properties.component';

describe('RegisterPropertiesComponent', () => {
  let component: RegisterPropertiesComponent;
  let fixture: ComponentFixture<RegisterPropertiesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterPropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
