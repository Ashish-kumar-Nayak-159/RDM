import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationMenuSettingsComponent } from './application-menu-settings.component';

describe('ApplicationMenuSettingsComponent', () => {
  let component: ApplicationMenuSettingsComponent;
  let fixture: ComponentFixture<ApplicationMenuSettingsComponent>;

  beforeEach(async(() => {
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
