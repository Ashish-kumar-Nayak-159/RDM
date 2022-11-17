import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationHistoricalLiveDataComponent } from './application-historical-live-data.component';

describe('ApplicationHistoricalLiveDataComponent', () => {
  let component: ApplicationHistoricalLiveDataComponent;
  let fixture: ComponentFixture<ApplicationHistoricalLiveDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationHistoricalLiveDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationHistoricalLiveDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
