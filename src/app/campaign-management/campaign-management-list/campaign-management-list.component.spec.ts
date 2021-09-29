import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CampaignManagementListComponent } from './campaign-management-list.component';

describe('CampaignManagementListComponent', () => {
  let component: CampaignManagementListComponent;
  let fixture: ComponentFixture<CampaignManagementListComponent>;

  beforeEach(waitForAsync(() => {
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
