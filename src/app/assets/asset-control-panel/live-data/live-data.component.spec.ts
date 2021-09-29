import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LiveDataComponent } from './live-data.component';

describe('LiveDataComponent', () => {
  let component: LiveDataComponent;
  let fixture: ComponentFixture<LiveDataComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LiveDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
