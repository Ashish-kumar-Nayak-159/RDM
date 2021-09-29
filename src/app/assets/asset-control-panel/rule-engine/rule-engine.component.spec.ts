import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RuleEngineComponent } from './rule-engine.component';

describe('RuleEngineComponent', () => {
  let component: RuleEngineComponent;
  let fixture: ComponentFixture<RuleEngineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RuleEngineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RuleEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
