import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationDatabaseConfigurationComponent } from './application-database-configuration.component';

describe('ApplicationDatabaseConfigurationComponent', () => {
  let component: ApplicationDatabaseConfigurationComponent;
  let fixture: ComponentFixture<ApplicationDatabaseConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationDatabaseConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationDatabaseConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
