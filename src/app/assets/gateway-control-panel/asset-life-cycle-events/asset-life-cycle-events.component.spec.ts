import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AssetLifeCycleEventsComponent } from './asset-life-cycle-events.component';

describe('AssetLifeCycleEventsComponent', () => {
  let component: AssetLifeCycleEventsComponent;
  let fixture: ComponentFixture<AssetLifeCycleEventsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetLifeCycleEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetLifeCycleEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
