import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetUptimeComponent } from './asset-uptime.component';

describe('AssetUptimeComponent', () => {
  let component: AssetUptimeComponent;
  let fixture: ComponentFixture<AssetUptimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetUptimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetUptimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
