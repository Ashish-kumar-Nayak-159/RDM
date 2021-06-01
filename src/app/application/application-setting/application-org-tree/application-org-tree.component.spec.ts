import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationOrgTreeComponent } from './application-org-tree.component';

describe('ApplicationOrgTreeComponent', () => {
  let component: ApplicationOrgTreeComponent;
  let fixture: ComponentFixture<ApplicationOrgTreeComponent>;

  beforeEach(async(() => {
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
