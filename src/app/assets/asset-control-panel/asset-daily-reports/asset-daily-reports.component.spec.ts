import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDailyReportsComponent } from './asset-daily-reports.component';

describe('AssetDailyReportsComponent', () => {
  let component: AssetDailyReportsComponent;
  let fixture: ComponentFixture<AssetDailyReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetDailyReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetDailyReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
