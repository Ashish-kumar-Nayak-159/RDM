import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationFilterSettingsComponent } from './application-filter-settings.component';

describe('ApplicationFilterSettingsComponent', () => {
  let component: ApplicationFilterSettingsComponent;
  let fixture: ComponentFixture<ApplicationFilterSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationFilterSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationFilterSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
