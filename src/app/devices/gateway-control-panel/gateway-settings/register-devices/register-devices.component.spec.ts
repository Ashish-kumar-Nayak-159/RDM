import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDevicesComponent } from './register-devices.component';

describe('RegisterDevicesComponent', () => {
  let component: RegisterDevicesComponent;
  let fixture: ComponentFixture<RegisterDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
