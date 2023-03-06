import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivewidgetComponent } from './livewidget.component';

describe('LivewidgetComponent', () => {
  let component: LivewidgetComponent;
  let fixture: ComponentFixture<LivewidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LivewidgetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LivewidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
