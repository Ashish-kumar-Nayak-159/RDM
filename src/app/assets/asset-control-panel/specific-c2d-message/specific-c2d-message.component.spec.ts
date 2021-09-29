import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpecificC2dMessageComponent } from './specific-c2d-message.component';

describe('SpecificC2dMessageComponent', () => {
  let component: SpecificC2dMessageComponent;
  let fixture: ComponentFixture<SpecificC2dMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificC2dMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificC2dMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
