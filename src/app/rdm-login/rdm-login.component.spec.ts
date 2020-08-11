import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RDMLoginComponent } from './rdm-login.component';

describe('RDMLoginComponent', () => {
  let component: RDMLoginComponent;
  let fixture: ComponentFixture<RDMLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RDMLoginComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RDMLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
