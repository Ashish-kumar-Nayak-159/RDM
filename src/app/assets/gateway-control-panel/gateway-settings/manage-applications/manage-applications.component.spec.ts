import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageApplicationsComponent } from './manage-applications.component';

describe('ManageApplicationsComponent', () => {
  let component: ManageApplicationsComponent;
  let fixture: ComponentFixture<ManageApplicationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageApplicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
