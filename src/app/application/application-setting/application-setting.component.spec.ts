import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationSettingComponent } from './application-setting.component';

describe('ApplicationSettingComponent', () => {
  let component: ApplicationSettingComponent;
  let fixture: ComponentFixture<ApplicationSettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationSettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
