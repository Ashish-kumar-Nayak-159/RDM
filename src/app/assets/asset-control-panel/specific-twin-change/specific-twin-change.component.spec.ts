import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SpecificTwinChangeComponent } from './specific-twin-change.component';

describe('SpecificTwinChangeComponent', () => {
  let component: SpecificTwinChangeComponent;
  let fixture: ComponentFixture<SpecificTwinChangeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SpecificTwinChangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecificTwinChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
