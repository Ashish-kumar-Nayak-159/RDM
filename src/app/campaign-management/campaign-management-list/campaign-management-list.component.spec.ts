import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignManagementListComponent } from './campaign-management-list.component';

describe('CampaignManagementListComponent', () => {
  let component: CampaignManagementListComponent;
  let fixture: ComponentFixture<CampaignManagementListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CampaignManagementListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
