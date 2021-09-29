import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { C2dPurgeComponent } from './c2d-purge.component';

describe('C2dPurgeComponent', () => {
  let component: C2dPurgeComponent;
  let fixture: ComponentFixture<C2dPurgeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ C2dPurgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(C2dPurgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
