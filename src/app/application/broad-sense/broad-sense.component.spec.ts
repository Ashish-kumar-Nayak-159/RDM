import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BroadSenseComponent } from './broad-sense.component';

describe('BroadSenseComponent', () => {
  let component: BroadSenseComponent;
  let fixture: ComponentFixture<BroadSenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BroadSenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BroadSenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
