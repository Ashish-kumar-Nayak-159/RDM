import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationEmailAliasComponent } from './application-email-alias.component';

describe('ApplicationEmailAliasComponent', () => {
  let component: ApplicationEmailAliasComponent;
  let fixture: ComponentFixture<ApplicationEmailAliasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationEmailAliasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationEmailAliasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
