import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationRolesComponent } from './application-roles.component';

describe('ApplicationRolesComponent', () => {
  let component: ApplicationRolesComponent;
  let fixture: ComponentFixture<ApplicationRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
