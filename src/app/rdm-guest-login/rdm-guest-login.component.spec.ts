import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RdmGuestLoginComponent } from './rdm-guest-login.component';

describe('RdmGuestLoginComponent', () => {
  let component: RdmGuestLoginComponent;
  let fixture: ComponentFixture<RdmGuestLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RdmGuestLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RdmGuestLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
