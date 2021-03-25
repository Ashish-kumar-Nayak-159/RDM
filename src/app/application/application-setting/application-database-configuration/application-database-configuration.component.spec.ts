import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationDatabaseConfigurationComponent } from './application-database-configuration.component';

describe('ApplicationDatabaseConfigurationComponent', () => {
  let component: ApplicationDatabaseConfigurationComponent;
  let fixture: ComponentFixture<ApplicationDatabaseConfigurationComponent>;

  beforeEach(async(() => {
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
