import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddCampaignComponent } from './add-campaign.component';

describe('AddCampaignComponent', () => {
  let component: AddCampaignComponent;
  let fixture: ComponentFixture<AddCampaignComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCampaignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
