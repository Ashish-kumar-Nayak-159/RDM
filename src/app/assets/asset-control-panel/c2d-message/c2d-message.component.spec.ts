import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { C2dMessageComponent } from './c2d-message.component';

describe('C2dMessageComponent', () => {
  let component: C2dMessageComponent;
  let fixture: ComponentFixture<C2dMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ C2dMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(C2dMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
