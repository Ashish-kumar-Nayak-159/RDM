import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationRolesComponent } from './application-roles.component';

describe('ApplicationRolesComponent', () => {
  let component: ApplicationRolesComponent;
  let fixture: ComponentFixture<ApplicationRolesComponent>;

  beforeEach(waitForAsync(() => {
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
