import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationMenuSettingsComponent } from './application-menu-settings.component';

describe('ApplicationMenuSettingsComponent', () => {
  let component: ApplicationMenuSettingsComponent;
  let fixture: ComponentFixture<ApplicationMenuSettingsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationMenuSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationMenuSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
