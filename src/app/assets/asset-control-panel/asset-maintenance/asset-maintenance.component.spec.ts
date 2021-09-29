import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetMaintenanceComponent } from './asset-maintenance.component';

describe('AssetMaintenanceComponent', () => {
  let component: AssetMaintenanceComponent;
  let fixture: ComponentFixture<AssetMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
