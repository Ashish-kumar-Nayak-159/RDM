import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeartbeatComponent } from './heartbeat.component';

describe('HeartbeatComponent', () => {
  let component: HeartbeatComponent;
  let fixture: ComponentFixture<HeartbeatComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HeartbeatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeartbeatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
