import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { C2dPurgeComponent } from './c2d-purge.component';

describe('C2dPurgeComponent', () => {
  let component: C2dPurgeComponent;
  let fixture: ComponentFixture<C2dPurgeComponent>;

  beforeEach(async(() => {
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
