import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivelinechartComponent } from './livelinechart.component';

describe('LivelinechartComponent', () => {
  let component: LivelinechartComponent;
  let fixture: ComponentFixture<LivelinechartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LivelinechartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivelinechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
