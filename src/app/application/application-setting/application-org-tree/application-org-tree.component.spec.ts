import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApplicationOrgTreeComponent } from './application-org-tree.component';

describe('ApplicationOrgTreeComponent', () => {
  let component: ApplicationOrgTreeComponent;
  let fixture: ComponentFixture<ApplicationOrgTreeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplicationOrgTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationOrgTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
